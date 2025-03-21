document.getElementById('file-input').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    document.getElementById('file-name').textContent = `Selected File: ${file.name}`;
    document.getElementById('file-size').textContent = `File Size: ${(file.size / 1024).toFixed(2)} KB`;
  }
});

document.getElementById('convert-btn').addEventListener('click', async function () {
  const fileInput = document.getElementById('file-input');
  const targetFormat = document.getElementById('target-format').value;
  const file = fileInput.files[0];

  if (!file) {
    showError('Please select a file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetFormat', targetFormat);

  try {
    const response = await fetch('/convert', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Conversion failed.');
    }

    const result = await response.json();
    if (result.success) {
      document.getElementById('download-link').href = result.downloadUrl;
      document.getElementById('download-link').style.display = 'block';
      document.getElementById('converted-file-size').textContent = `Converted File Size: ${(result.fileSize / 1024).toFixed(2)} KB`;
    } else {
      showError(result.message || 'Conversion failed.');
    }
  } catch (error) {
    showError(error.message);
  }
});

function showError(message) {
  document.getElementById('error-message').textContent = message;
  setTimeout(() => {
    document.getElementById('error-message').textContent = '';
  }, 5000);
}
