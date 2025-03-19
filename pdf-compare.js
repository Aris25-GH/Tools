document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded!");

    document.getElementById('compare-btn').addEventListener('click', function () {
        console.log("Compare button clicked!");

        const file1 = document.getElementById('file1').files[0];
        const file2 = document.getElementById('file2').files[0];

        if (file1 && file2) {
            console.log("Files selected:", file1.name, file2.name);
            renderPDF(file1, 'pdf1-container');
            renderPDF(file2, 'pdf2-container');
        } else {
            alert('Please upload both PDF files.');
        }
    });

    // Debugging: Log selected file names
    document.getElementById('file1').addEventListener('change', function () {
        console.log("File 1 selected:", this.files[0] ? this.files[0].name : "No file selected");
    });

    document.getElementById('file2').addEventListener('change', function () {
        console.log("File 2 selected:", this.files[0] ? this.files[0].name : "No file selected");
    });
});

function renderPDF(file, containerId) {
    console.log("Rendering PDF:", file.name);
    const fileReader = new FileReader();

    fileReader.onload = function (event) {
        console.log("File read successfully!");
        const pdfData = new Uint8Array(event.target.result);

        // Load PDF using PDF.js
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });

        loadingTask.promise.then(function (pdf) {
            console.log("PDF loaded successfully! Total pages:", pdf.numPages);
            const container = document.getElementById(containerId);
            container.innerHTML = ''; // Clear previous content

            // Render each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                pdf.getPage(pageNum).then(function (page) {
                    console.log("Rendering page:", pageNum);
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

                    page.render(renderContext).promise.then(function () {
                        console.log("Page rendered:", pageNum);
                    }).catch(function (error) {
                        console.error("Error rendering page:", error);
                    });
                }).catch(function (error) {
                    console.error("Error retrieving page:", error);
                });
            }
        }).catch(function (error) {
            console.error("Error loading PDF:", error);
            alert("Failed to load PDF. Please ensure the file is valid.");
        });
    };

    fileReader.onerror = function (error) {
        console.error("Error reading file:", error);
        alert("Failed to read the file. Please try again.");
    };

    fileReader.readAsArrayBuffer(file);
}
