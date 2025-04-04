import streamlit as st
from streamlit.runtime.uploaded_file_manager import UploadedFile

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.documents.base import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain_core.runnables import Runnable
from langchain.schema.output_parser import StrOutputParser
from langchain_community.document_loaders import PyMuPDFLoader
from typing import List
import os

from dotenv import load_dotenv,dotenv_values

load_dotenv()

# 1. 임시폴더에 파일 저장
def save_uploadedfile(uploadedfile: UploadedFile) -> str:
  temp_dir = "data/temp-pdf"
  if not os.path.exists(temp_dir):
    os.makedirs(temp_dir)
  file_path = os.path.join(temp_dir, uploadedfile.name)
  with open(file_path, 'wb') as f:
    f.write(uploadedfile.read())
  return file_path

# 2. 저장된 pdf 파일을 Document로 변환
def pdf_to_documents(pdf_path: str) -> List[Document]:
  documents = []
  loader = PyMuPDFLoader(pdf_path)
  doc = loader.load()
  for d in doc:
    d.metadata['file_path'] = pdf_path
  documents.extend(doc)
  return documents

# 3. Document를 더 작은 Document로 변환
def chunk_documents(documents: List[Document]) -> List[Document]:
  text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
  return text_splitter.split_documents(documents)

# 4. Document를 벡터DB에 저장
def save_to_vector_store(documents: List[Document]) -> None:
  if not documents:
    return
  
  embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
  
  doc_groups = {}
  
  for doc in documents:
    file_path = doc.metadata.get('file_path', "unknown")
    
    file_name = os.path.basename(file_path).replace('.pdf', '')

    if file_name not in doc_groups:
      doc_groups[file_name] = []
    doc_groups[file_name].append(doc)

  for group_name, group_docs in doc_groups.items():
    index_path = f"data/faiss_index/{group_name}"
  
    os.makedirs("data/faiss_index", exist_ok=True)

    if os.path.exists(index_path):
      vector_store = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
      vector_store.add_documents(group_docs)
    else:
      vector_store = FAISS.from_documents(group_docs, embedding=embeddings)
    vector_store.save_local(index_path)

def pdf_list() -> List:
  faiss_index_path = "data/faiss_index"
  if os.path.exists(faiss_index_path):
    pdf_list = [p for p in os.listdir(faiss_index_path)]
  
    return pdf_list
  else:
    return []
