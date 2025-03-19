document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded!");

    document.getElementById('compare-btn').addEventListener('click', function () {
        console.log("Compare button clicked!");

        const file1 = document.getElementById('file1').files[0];
        const file2 = document.getElementById('file2').files[0];

        if (file1 && file2) {
            console.log("Files selected:", file1.name, file2.name);
            comparePDFs(file1, file2);
        } else {
            alert('Please upload both PDF files.');
        }
    });
});

async function comparePDFs(file1, file2) {
    const pdf1 = await loadPDF(file1);
    const pdf2 = await loadPDF(file2);

    const canvasContainer1 = document.getElementById('pdf1-container');
    const canvasContainer2 = document.getElementById('pdf2-container');
    
    canvasContainer1.innerHTML = '';
    canvasContainer2.innerHTML = '';

    const comparedDoc = await PDFLib.PDFDocument.create();

    const numPages = Math.max(pdf1.numPages, pdf2.numPages);

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const [page1Canvas, page1Ctx] = createCanvas();
        const [page2Canvas, page2Ctx] = createCanvas();

        if (pageNum <= pdf1.numPages) {
            const page1 = await pdf1.getPage(pageNum);
            await renderPage(page1, page1Ctx);
        }

        if (pageNum <= pdf2.numPages) {
            const page2 = await pdf2.getPage(pageNum);
            await renderPage(page2, page2Ctx);
        }

        highlightDifferences(page1Canvas, page2Canvas, page1Ctx);
        canvasContainer1.appendChild(page1Canvas);
        canvasContainer2.appendChild(page2Canvas);

        const pdfPage = await comparedDoc.addPage([page1Canvas.width, page1Canvas.height]);
        const { width, height } = pdfPage.getSize();
        const imgBytes = await canvasToImageBytes(page1Canvas);
        const image = await comparedDoc.embedPng(imgBytes);
        pdfPage.drawImage(image, { x: 0, y: 0, width, height });
    }

    const pdfBytes = await comparedDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    document.getElementById('download-btn').disabled = false;
    document.getElementById('download-btn').addEventListener('click', function () {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Compared_PDF.pdf';
        a.click();
    });
}

async function loadPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    return pdfjsLib.getDocument({ data: arrayBuffer }).promise;
}

function createCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    return [canvas, ctx];
}

async function renderPage(page, ctx) {
    const viewport = page.getViewport({ scale: 1.5 });
    ctx.canvas.width = viewport.width;
    ctx.canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
}

function highlightDifferences(canvas1, canvas2, ctx1) {
    const imgData1 = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
    const imgData2 = canvas2.getContext('2d').getImageData(0, 0, canvas2.width, canvas2.height);

    for (let i = 0; i < imgData1.data.length; i += 4) {
        if (
            imgData1.data[i] !== imgData2.data[i] ||
            imgData1.data[i + 1] !== imgData2.data[i + 1] ||
            imgData1.data[i + 2] !== imgData2.data[i + 2]
        ) {
            imgData1.data[i] = 0; 
            imgData1.data[i + 1] = 255; 
            imgData1.data[i + 2] = 0;
        }
    }

    ctx1.putImageData(imgData1, 0, 0);
}

async function canvasToImageBytes(canvas) {
    return new Promise(resolve => {
        canvas.toBlob(blob => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(new Uint8Array(reader.result));
            reader.readAsArrayBuffer(blob);
        }, 'image/png');
    });
}
