import streamlit as st
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.runnables import Runnable
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from typing import List, Dict
import os


@st.cache_data
def process_question(user_question):
  embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
  
  faiss_indices = get_all_faiss_indices()
  
  all_results = search_all_indices(faiss_indices, user_question, embeddings)

  chain = get_rag_chain()

  context = "\n\n".join([doc.page_content for doc in all_results])

  response = chain.invoke({"question": user_question, "context": context})

  return response, all_results


def get_all_faiss_indices() -> List[str]:
  """파일 시스템에서 모든 FAISS 인덱스 디렉토리 경로를 찾아 반환합니다."""
  indices = []
  base_dir = "data/faiss_index"
  
  if not os.path.exists(base_dir):
    return indices
  
  for item in os.listdir(base_dir):
    item_path = os.path.join(base_dir, item)
    if os.path.isdir(item_path) and os.path.exists(os.path.join(item_path,"index.faiss")):
      indices.append(item_path)
  return indices

def search_all_indices(indices: List[str], query: str, embeddings, top_k: int = 3) -> List[Document]:
  """모든 인덱스에서 쿼리에 관련된 문서를 검색합니다."""
  all_docs = []
  
  for index_path in indices:
    try:
      vector_store = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
      docs: List[Document] = vector_store.similarity_search(query, k=top_k)

      # for doc in docs:
      #   doc.metadata['index_source'] = os.path.basename(index_path)

      all_docs.extend(docs)
    except Exception as e:
      st.warning(f"인덱스 '{index_path}' 로드 중 오류 발생: {str(e)}")
  
  return all_docs

def get_rag_chain() -> Runnable:
  template = """
  다음의 컨텍스트를 활용해서 질문에 답변해줘
  - 질문에 대한 응답을 해줘
  - 간결하게 5줄 이내로 해줘
  - 곧바로 응답결과를 말해줘
  
  컨텍스트: {context}
  
  질문: {question}
  
  응답:
  """
  
  custom_rag_prompt = PromptTemplate.from_template(template)
  model= ChatOpenAI(model="gpt-4o-mini")
  
  return custom_rag_prompt | model | StrOutputParser()