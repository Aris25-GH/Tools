from flask import Flask, request, send_file, render_template
import fitz   # PyMuPDF
from pdf_diff import make_diff
import os

app = Flask(__name__)

def compare_pdfs(pdf1_path, pdf2_path, output_path):
    pdf1 = fitz.open(pdf1_path)
    pdf2 = fitz.open(pdf2_path)
    diff = make_diff(pdf1, pdf2)
    diff.save(output_path)

@app.route('/', methods=['GET'])
def index():
    return render_template('pdf_compare.html')

@app.route('/Tools/compare', methods=['POST'])
def upload_files():
    pdf1 = request.files['pdf1']
    pdf2 = request.files['pdf2']
    pdf1_path = f"uploads/{pdf1.filename}"
    pdf2_path = f"uploads/{pdf2.filename}"
    output_path = f"outputs/diff_{pdf1.filename}"

    pdf1.save(pdf1_path)
    pdf2.save(pdf2_path)

    compare_pdfs(pdf1_path, pdf2_path, output_path)

    return send_file(output_path, as_attachment=True)

if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('outputs', exist_ok=True)
    app.run(debug=True)
