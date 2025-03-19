// pdf-compare.js
document.getElementById('compare-btn').addEventListener('click', function () {
    console.log("Compare button clicked!"); // Debugging
    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];

    if (file1 && file2) {
        console.log("Files selected:", file1.name, file2.name); // Debugging
        renderPDF(file1, 'pdf1-container');
        renderPDF(file2, 'pdf2-container');
    } else {
        alert('Please upload both PDF files.');
    }
});

function renderPDF(file, containerId) {
    console.log("Rendering PDF:", file.name); // Debugging
    const fileReader = new FileReader();

    fileReader.onload = function (event) {
        console.log("File read successfully!"); // Debugging
        const pdfData = new Uint8Array(event.target.result);

        // Load PDF using PDF.js
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });

        loadingTask.promise
            .then(function (pdf) {
                console.log("PDF loaded successfully! Total pages:", pdf.numPages); // Debugging
                const container = document.getElementById(containerId);
                container.innerHTML = ''; // Clear previous content

                // Render each page
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    pdf.getPage(pageNum)
                        .then(function (page) {
                            console.log("Rendering page:", pageNum); // Debugging
                            const scale = 1.5; // Adjust scale for better visibility
                            const viewport = page.getViewport({ scale });

                            // Create a canvas element for the page
                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            // Append the canvas to the container
                            container.appendChild(canvas);

                            // Render the page on the canvas
                            const renderContext = {
                                canvasContext: context,
                                viewport: viewport,
                            };
                            page.render(renderContext);
                        })
                        .catch(function (error) {
                            console.error("Error rendering page:", error); // Debugging
                        });
                }
            })
            .catch(function (error) {
                console.error("Error loading PDF:", error); // Debugging
                alert("Failed to load PDF. Please ensure the file is valid.");
            });
    };

    fileReader.onerror = function (error) {
        console.error("Error reading file:", error); // Debugging
        alert("Failed to read the file. Please try again.");
    };

    // Read the file as an ArrayBuffer
    fileReader.readAsArrayBuffer(file);
}
