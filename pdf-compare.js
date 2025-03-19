// pdf-compare.js
document.getElementById('compare-btn').addEventListener('click', function () {
    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];

    if (file1 && file2) {
        renderPDF(file1, 'pdf1-container');
        renderPDF(file2, 'pdf2-container');
    } else {
        alert('Please upload both PDF files.');
    }
});

function renderPDF(file, containerId) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        const pdfData = new Uint8Array(event.target.result);
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });

        loadingTask.promise.then(function (pdf) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                pdf.getPage(pageNum).then(function (page) {
                    const scale = 1.5;
                    const viewport = page.getViewport({ scale });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    container.appendChild(canvas);

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    page.render(renderContext);
                });
            }
        });
    };
    fileReader.readAsArrayBuffer(file);
}
