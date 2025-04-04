from src.pdf_to_db import save_uploadedfile, pdf_to_documents, chunk_documents, save_to_vector_store, pdf_list
from src.faq import process_question
from src.pdf_to_image import convert_pdf_to_images, display_pdf_page, natural_sort_key
import streamlit as st
from streamlit.runtime.uploaded_file_manager import UploadedFile
import os

def main():
    # st.text(dotenv_values(".env"))
    # st.text("셋팅완료")

  st.set_page_config("기술 문서 답변 챗봇", layout="wide")
  left_column, right_column = st.columns([1,1])


  with left_column:
    st.header("기술 문서 답변 챗봇")
    
    st.subheader("QnA", divider=True)
    user_question = st.text_input("PDF 문서에 대해서 질문해주세요.", placeholder="새로운 네트워크 관리 분석 도구는 어떤게 있어?")
    if user_question:
      response, context = process_question(user_question)
      st.text(response)
      for document in context:
        with st.expander("관련 문서"):
          st.text(document.page_content)
          file_path = document.metadata.get('source', '')
          page_number = document.metadata.get('page',0) + 1
          button_key = f"link_{file_path}_{page_number}"
          reference_button = st.button(f"{os.path.basename(file_path)} pg.{page_number}", key=button_key)
          if reference_button:
            st.session_state.page_number = str(page_number)
            st.session_state.file_path = str(file_path)

    st.subheader("PDF 업로드", divider=True)
    pdf_doc = st.file_uploader("PDF Uploader", type="pdf")
    button = st.button("PDF 업로드 하기")
    if pdf_doc and button:
      with st.spinner("PDF문서 저장중"):
        pdf_path = save_uploadedfile(pdf_doc) 
        pdf_document = pdf_to_documents(pdf_path)
        smaller_document = chunk_documents(pdf_document)
        save_to_vector_store(smaller_document)
      with st.spinner("PDF페이지를 이미지로 변경중"):
        images = convert_pdf_to_images(pdf_path)
        st.session_state.images = images

    st.subheader("업로드된 PDF 파일 리스트", divider=True)
    pdf_files = pdf_list()
    if pdf_files:
      for idx, file_name in enumerate(pdf_files,1):
        st.write(f"{idx}. {file_name}")
    else:
      st.info("업로드된 pdf파일이 없습니다.")


  with right_column:
    page_number = st.session_state.get('page_number')
    if page_number:
      page_number = int(page_number)
      selected_pdf = st.session_state.get('file_path','')

      pdf_basename = os.path.basename(selected_pdf).replace('.pdf','')
      image_folder = os.path.join('data/temp-pdf-images', pdf_basename)

      if os.path.exists(image_folder):
        try:
          images = sorted(os.listdir(image_folder), key=natural_sort_key)
          print(images)
          image_paths = [os.path.join(image_folder, image) for image in images]
          print(page_number)
          print(image_paths[page_number - 1])
          display_pdf_page(image_paths[page_number - 1], page_number)
        except Exception as e:
          st.error(f"이미지 디렉토리 처리 오류: {str(e)}")
      else:
        st.error(f"이미지 디렉토리를 찾을 수 없습니다: {image_folder}")

if __name__ == "__main__":
  main()