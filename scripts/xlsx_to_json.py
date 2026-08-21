#!/usr/bin/env python3
"""Convertit la première feuille utile d'un classeur XLSX en données web."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET


MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
NS = {"m": MAIN_NS, "r": REL_NS, "p": PKG_REL_NS}


def normalize_header(value: str) -> str:
    value = unicodedata.normalize("NFD", value or "")
    value = "".join(char for char in value if unicodedata.category(char) != "Mn")
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def column_index(reference: str) -> int:
    letters = re.match(r"[A-Z]+", reference).group(0)
    index = 0
    for letter in letters:
        index = index * 26 + ord(letter) - 64
    return index - 1


def shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    return ["".join(item.itertext()) for item in root.findall("m:si", NS)]


def first_sheet_path(archive: zipfile.ZipFile) -> str:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    sheet = workbook.find("m:sheets/m:sheet", NS)
    if sheet is None:
        raise ValueError("Le classeur ne contient aucune feuille.")
    relationship_id = sheet.attrib[f"{{{REL_NS}}}id"]
    relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    for relation in relationships.findall("p:Relationship", NS):
        if relation.attrib.get("Id") == relationship_id:
            target = relation.attrib["Target"].lstrip("/")
            return target if target.startswith("xl/") else f"xl/{target}"
    raise ValueError("La feuille du classeur est introuvable.")


def read_cell(cell: ET.Element, strings: list[str]) -> str:
    kind = cell.attrib.get("t")
    if kind == "inlineStr":
        inline = cell.find("m:is", NS)
        return "" if inline is None else "".join(inline.itertext())
    value = cell.findtext("m:v", default="", namespaces=NS)
    if kind == "s" and value:
        return strings[int(value)]
    if kind == "b":
        return "Oui" if value == "1" else "Non"
    return value


def read_rows(source: Path) -> list[list[str]]:
    with zipfile.ZipFile(source) as archive:
        strings = shared_strings(archive)
        sheet = ET.fromstring(archive.read(first_sheet_path(archive)))
        rows: list[list[str]] = []
        for row_node in sheet.findall("m:sheetData/m:row", NS):
            values: dict[int, str] = {}
            for cell in row_node.findall("m:c", NS):
                values[column_index(cell.attrib["r"])] = read_cell(cell, strings)
            if values:
                width = max(values) + 1
                rows.append([values.get(index, "") for index in range(width)])
        return rows


def split_values(value: str) -> list[str]:
    if not value or not value.strip():
        return []
    items = re.split(r"\s*(?:•|;|\n|\|)\s*", value.strip())
    return list(dict.fromkeys(item.strip() for item in items if item.strip()))


ALIASES = {
    "name": ("nom", "titre"),
    "prompt": ("promptcomplet", "prompt"),
    "niveau": ("niveau",),
    "tone": ("tonalite",),
    "reuse": ("reutilisation",),
    "phase": ("phase",),
    "session": ("session",),
    "competence": ("competence", "competences"),
    "description": ("description",),
    "useCase": ("casdusage", "usage"),
    "subjects": ("sujets", "motscles"),
    "objectives": ("objectifs",),
    "prerequisites": ("prerequis",),
    "comment": ("commentaire",),
    "version": ("version",),
}


def build_records(rows: list[list[str]]) -> tuple[list[dict], list[str]]:
    if not rows:
        return [], []
    headers = [normalize_header(value) for value in rows[0]]
    positions: dict[str, int] = {}
    for field, aliases in ALIASES.items():
        for alias in aliases:
            if alias in headers:
                positions[field] = headers.index(alias)
                break

    if "name" not in positions or "prompt" not in positions:
        raise ValueError("Les colonnes Nom et Prompt_Complet sont obligatoires.")

    def value(row: list[str], field: str) -> str:
        position = positions.get(field)
        return row[position].strip() if position is not None and position < len(row) else ""

    records = []
    for number, row in enumerate(rows[1:], start=1):
        name = value(row, "name")
        prompt = value(row, "prompt")
        if not name or not prompt:
            continue
        records.append(
            {
                "id": f"p{number:03d}",
                "name": name,
                "prompt": prompt,
                "niveau": value(row, "niveau"),
                "tone": value(row, "tone"),
                "reuse": value(row, "reuse"),
                "phase": split_values(value(row, "phase")),
                "session": split_values(value(row, "session")),
                "competence": split_values(value(row, "competence")),
                "description": value(row, "description"),
                "useCase": value(row, "useCase"),
                "subjects": value(row, "subjects"),
                "objectives": value(row, "objectives"),
                "prerequisites": value(row, "prerequisites"),
                "comment": value(row, "comment"),
                "version": value(row, "version"),
            }
        )
    return records, [header for header in headers if header]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    records, columns = build_records(read_rows(args.source))
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceFile": args.source.name,
        "count": len(records),
        "columns": columns,
        "prompts": records,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(records)} prompts écrits dans {args.output}")


if __name__ == "__main__":
    main()
