import streamlit as st
from typing import List
import fitz
import re
import os

@st.cache_data()
def convert_pdf_to_images(pdf_path: str, dpi: int = 250) -> List[str]:
  doc = fitz.open(pdf_path)
  image_paths = []

  image_file_path = os.path.basename(pdf_path).replace('.pdf','')

  base_folder = "data/temp-pdf-images"
  output_folder = os.path.join(base_folder, image_file_path)

  if not os.path.exists(output_folder):
    os.makedirs(output_folder, exist_ok=True)

  for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    
    zoom = dpi / 72
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    
    image_path = os.path.join(output_folder, f"page_{page_num + 1}.png")
    pix.save(image_path)
    image_paths.append(image_path)

  doc.close()
  return image_paths

def display_pdf_page(image_path: str, page_number: int) -> None:
  image_bytes = open(image_path, "rb").read()
  st.image(image_bytes, caption=f"Page {page_number}", output_format="PNG", width=600)

def natural_sort_key(s):
  return [int(text) if text.isdigit() else text for text in re.split(r'(\d+)', s)]