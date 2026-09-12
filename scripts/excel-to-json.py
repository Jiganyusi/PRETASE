#!/usr/bin/env python3
"""
Convert Excel sheet data to JSON for PRETASE web viewer.
Usage: python excel-to-json.py <input.xlsx> <output_dir>
"""

import sys
import json
import os
import re
from datetime import datetime, date, timedelta

try:
    import openpyxl
except ImportError:
    print("Error: openpyxl not installed. Run: pip install openpyxl")
    sys.exit(1)


def get_value(cell_value):
    """Convert cell value to JSON-serializable format."""
    if cell_value is None:
        return ""
    if isinstance(cell_value, (datetime, date)):
        return cell_value.strftime("%d-%m-%Y")
    if isinstance(cell_value, (int, float)) and 40000 < cell_value < 60000:
        base = datetime(1899, 12, 30)
        return (base + timedelta(days=int(cell_value))).strftime("%d-%m-%Y")
    return str(cell_value)


def build_m_rekening_lookup(sheet):
    """Build lookup dict from M Rekening sheet."""
    lookup = {}
    rows = list(sheet.iter_rows(values_only=True))
    
    # No header row - start from row 1
    for i in range(1, len(rows)):
        row = rows[i]
        if len(row) < 6:
            continue
        
        code = str(row[2] or "").strip() if row[2] else ""
        no_rek = str(row[3] or "").strip() if row[3] else ""
        nama = str(row[4] or "").strip() if row[4] else ""
        bank = str(row[5] or "").strip() if row[5] else ""
        
        if not no_rek or no_rek.startswith("="):
            continue
        
        lookup[no_rek] = {
            "code": code,
            "nama": nama,
            "bank": bank
        }
    
    return lookup


def resolve_vlookup(formula, row_data, m_rek_lookup):
    """Resolve VLOOKUP formula manually."""
    if not isinstance(formula, str) or "VLOOKUP" not in formula.upper():
        return formula
    
    # Parse VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])
    # Example: =VLOOKUP($I5,'M Rekening'!$D:$F,2,0)
    
    # Extract col_index_num
    match = re.search(r'VLOOKUP\([^,]+,\s*[^,]+,\s*(\d+)', formula, re.IGNORECASE)
    if not match:
        return formula
    
    col_index = int(match.group(1))  # 2 or 3
    
    # lookup_value is typically $I5 (col I = index 8 in 0-based)
    # We need to get the No rek from row_data[6] (which is from Excel col I)
    no_rek = row_data[6] if len(row_data) > 6 else ""
    
    if not no_rek:
        return formula
    
    # Lookup in M Rekening
    rek_info = m_rek_lookup.get(str(no_rek).strip())
    if not rek_info:
        return formula
    
    if col_index == 2:
        return rek_info["nama"]
    elif col_index == 3:
        return rek_info["bank"]
    
    return formula


def resolve_jenis_trx(formula):
    """Resolve Jenis Trx formula to get transfer type."""
    if not isinstance(formula, str):
        return formula
    
    formula_upper = formula.upper()
    if "IFT" in formula_upper:
        return "BRI ke BRI"
    elif "KLR" in formula_upper or "BIF" in formula_upper:
        return "BRI ke Bank Lain"
    elif "MASS" in formula_upper:
        return "Mass Transfer"
    
    return formula


def parse_sheet(sheet, m_rek_lookup):
    """Parse a single sheet and return headers and rows."""
    rows = list(sheet.iter_rows(values_only=True))
    
    # Find header row - look for row with "KET" in col D (index 3)
    header_row_idx = None
    for i, row in enumerate(rows):
        if len(row) > 3 and row[3] == "KET":
            header_row_idx = i
            break
    
    if header_row_idx is None:
        return None, []
    
    # Data rows
    data_rows = []
    current_date = None
    row_number = 0
    
    for i in range(header_row_idx + 1, len(rows)):
        row = rows[i]
        if not row or len(row) < 5:
            continue
        
        # Check for REKAP PEMBAYARAN - block start
        if row[0] and "REKAP PEMBAYARAN" in str(row[0]):
            current_date = None
            continue
        
        # Check for TRANSAKSI CAMS block header
        if row[1] and "TRANSAKSI CAMS" in str(row[1]):
            # Date should be in next row (col C / index 2)
            if i + 1 < len(rows):
                next_row = rows[i + 1]
                if next_row[2]:
                    date_val = next_row[2]
                    if isinstance(date_val, (datetime, date)):
                        current_date = date_val.strftime("%d-%m-%Y")
                    elif isinstance(date_val, (int, float)) and 40000 < date_val < 60000:
                        base = datetime(1899, 12, 30)
                        current_date = (base + timedelta(days=int(date_val))).strftime("%d-%m-%Y")
                    else:
                        current_date = str(date_val)
            continue
        
        # Skip date row (col C is a date)
        if row[2] and isinstance(row[2], (datetime, date)):
            continue
        if row[2] and isinstance(row[2], (int, float)) and 40000 < row[2] < 60000:
            continue
        
        # Skip empty rows - check if col D (Ket) has data
        ket = row[3] if len(row) > 3 else None
        if ket is None or str(ket).strip() == "":
            continue
        
        # Skip formula rows
        if isinstance(ket, str) and ket.startswith("="):
            continue
        
        # Skip special rows (Direkap, Disetujui, etc.)
        if str(ket).strip().lower() in ["direkap", "disetujui", "total"]:
            continue
        
        row_number += 1
        
        # Build row data
        # Visible columns: A(0)=No urut, D(3)=Ket, E(4)=Kebun, F(5)=Nilai, G(6)=Nama Rek, H(7)=Bank, I(8)=No rek, K(10)=Jenis Trx, M(12)=Lunas
        visible_indices = [0, 3, 4, 5, 6, 7, 8, 10, 12]
        row_data = [str(row_number)]  # No urut = sequential number
        
        for idx in visible_indices[1:]:  # Skip index 0, we already have row_number
            if idx < len(row):
                row_data.append(get_value(row[idx]))
            else:
                row_data.append("")
        
        # Resolve VLOOKUP for Nama Rek (index 4 in row_data) and Bank (index 5)
        if "VLOOKUP" in str(row_data[4]).upper():
            row_data[4] = resolve_vlookup(row_data[4], row_data, m_rek_lookup)
        if "VLOOKUP" in str(row_data[5]).upper():
            row_data[5] = resolve_vlookup(row_data[5], row_data, m_rek_lookup)
        
        # Resolve Jenis Trx formula
        if "IF" in str(row_data[7]).upper() and "LEFT" in str(row_data[7]).upper():
            row_data[7] = resolve_jenis_trx(row_data[7])
        
        # Use current_date if Lunas col is empty
        if not row_data[8] and current_date:
            row_data[8] = current_date
        
        data_rows.append(row_data)
    
    visible_headers = ["No urut", "Ket", "Kebun", "Nilai", "Nama Rek", "Bank", "No rek", "Jenis Trx", "Lunas"]
    
    return visible_headers, data_rows


def main():
    if len(sys.argv) < 3:
        print("Usage: python excel-to-json.py <input.xlsx> <output_dir>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_dir = sys.argv[2]
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    print(f"Reading {input_file}...")
    wb = openpyxl.load_workbook(input_file, read_only=True)
    
    # Build M Rekening lookup
    m_rek_sheet = wb["M Rekening"]
    m_rek_lookup = build_m_rekening_lookup(m_rek_sheet)
    print(f"M Rekening lookup: {len(m_rek_lookup)} entries")
    
    # Map sheet names (case-insensitive)
    sheet_map = {}
    for name in wb.sheetnames:
        sheet_map[name.lower().strip()] = name
    
    sheets_to_process = [
        ("email cdp", "email-cdp.json"),
        ("rekrut", "rekrut.json"),
        ("bapp", "bapp.json"),
        ("cola", "cola.json"),
        ("cs", "cs.json"),
        ("kontanan", "kontanan.json"),
        ("perdin ro", "perdin-ro.json"),
        ("lain-lain", "lain-lain.json"),
    ]
    
    for sheet_key, output_file in sheets_to_process:
        actual_name = sheet_map.get(sheet_key)
        if actual_name is None:
            print(f"  Sheet '{sheet_key}' not found, skipping")
            continue
        
        print(f"  Processing '{actual_name}'...")
        sheet = wb[actual_name]
        headers, rows = parse_sheet(sheet, m_rek_lookup)
        
        if headers is None:
            print(f"    Warning: Could not find header row for '{actual_name}'")
            continue
        
        output = {
            "sheet": actual_name,
            "headers": headers,
            "rows": rows,
            "total": len(rows)
        }
        
        output_path = os.path.join(output_dir, output_file)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"    Saved {len(rows)} rows to {output_path}")
    
    wb.close()
    print("Done!")


if __name__ == "__main__":
    main()
