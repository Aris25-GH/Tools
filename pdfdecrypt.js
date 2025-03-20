// pdfdecrypt.js

document.getElementById('convertBtn').addEventListener('click', function () {
    const fileInput = document.getElementById('fileInput');
    const downloadLink = document.getElementById('downloadLink');
    const status = document.getElementById('status');

    if (fileInput.files.length === 0) {
        status.textContent = "Please select a file.";
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const fileContent = event.target.result;

        // Create a PDF
        const pdfDoc = window.PDFLib.PDFDocument.create();
        pdfDoc.then((pdf) => {
            const page = pdf.addPage([600, 400]);
            page.drawText(fileContent, {
                x: 50,
                y: 350,
                size: 12,
            });

            return pdf.save();
        }).then((pdfBytes) => {
            // Create a Blob and download link
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download = `${file.name.replace(/\.[^/.]+$/, "")}.pdf`; // Set the filename
            downloadLink.style.display = 'block';
            status.textContent = "PDF is ready! Click the download button.";
        }).catch((error) => {
            status.textContent = "Failed to create PDF: " + error.message;
        });
    };

    reader.readAsText(file); // Read the file as text
});
