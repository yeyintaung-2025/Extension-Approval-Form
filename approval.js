// Row and input creation
function createInputRow(rowNum) {
  const row = document.createElement('div');
  row.className = 'row';
  for (let col = 1; col <= 18; col++) {
    const box = document.createElement('div');
    box.className = `box col-${col}`;
    if (col === 1) {
      box.textContent = rowNum;
    } else {
      const input = document.createElement('input');
      input.type = col === 7 ? 'date' : 'text';
      input.id = `row${rowNum}-col${col}`;
      // Col 13 through 18 are calculated and should be readonly
      if (col >= 13 && col <= 18) {
        input.readOnly = true;
      }

      // Add input event listener for formatting and calculations
      // For all number columns (8-18), format as whole numbers.
      if (col >= 8 && col <= 18) { // Changed this condition to include all calculated columns
        input.addEventListener('input', () => {
          formatNumber(input, 0); // Always format as whole number
          calcRow(rowNum);
          updateSummary();
        });
      }
      // The output columns (col 13-18) are readonly, their values are set by calcRow.
      // The formatting will be applied when setting their values in calcRow.

      box.appendChild(input);
    }
    row.appendChild(box);
  }
  return row;
}
const container = document.getElementById('inputRowsContainer');
for (let i = 1; i <= 8; i++) {
  container.appendChild(createInputRow(i));
}

// Formatting and parsing
function parseFormattedNumber(val) {
    // Remove commas, then parse as float
    // Also remove "Need " prefix if present
    return parseFloat(val.replace('Need ', '').replace(/,/g, '')) || 0;
}

function formatNumber(el, decimalPlaces) {
    // Remove all non-numeric characters except for a single decimal point
    // For whole numbers, we can simplify this to just allow digits
    let cleanedValue = el.value.replace(/[^0-9]/g, ''); // Modified to remove decimal points

    const num = parseFloat(cleanedValue);
    if (isNaN(num)) {
        el.value = '';
        return;
    }

    // Format with 0 decimal places and thousands separator
    el.value = num.toLocaleString('en-US', {
        minimumFractionDigits: 0, // Always 0 for whole numbers
        maximumFractionDigits: 0  // Always 0 for whole numbers
    });
}

// Row calculations
function calcRow(rowNum) {
  const getNum = (col) => parseFormattedNumber(document.getElementById(`row${rowNum}-col${col}`).value);
  const getDate = (id) => {
    const d = new Date(document.getElementById(id).value);
    return isNaN(d) ? null : d;
  };
  // Use the actual current date from the device
  const today = new Date();
  const col7 = getDate(`row${rowNum}-col7`);
  let days = col7 ? Math.max(0, Math.floor((today - col7) / (1000 * 60 * 60 * 24))) : 0;

  const col8 = getNum(8);
  const col9 = getNum(9);
  const col10 = getNum(10);
  const col11 = getNum(11);
  const col12 = getNum(12);

  const col13_val = col10 * 0.28 / 365 * days;
  const sum89 = col8 + col9;

  let col14_val = sum89 >= col10 ? 0 : col10 - sum89;
  let col15_val = col14_val > 0 ? col11 : (col10 + col11 - sum89);
  col15_val = Math.max(0, col15_val);

  let col16_val = col14_val > 0 ? col12 : (col10 + col11 + col12 - col15_val - sum89);
  col16_val = Math.max(0, col16_val);

  let col17_val = col14_val > 0 ? col13_val : (col10 + col11 + col12 + col13_val - col15_val - col16_val - sum89);
  col17_val = Math.max(0, col17_val);

  const col18_val = col15_val + col16_val + col17_val;

  // Apply formatting to calculated values for columns 13-18
  // All now formatted to 0 decimal places
  const col13Input = document.getElementById(`row${rowNum}-col13`);
  col13Input.value = col13_val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const col14Input = document.getElementById(`row${rowNum}-col14`);
  if (col14_val > 0) {
    col14Input.value = `Need ${col14_val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    col14Input.classList.add('highlight-red');
  } else {
    col14Input.value = col14_val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    col14Input.classList.remove('highlight-red');
  }

  const col15Input = document.getElementById(`row${rowNum}-col15`);
  col15Input.value = col15_val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const col16Input = document.getElementById(`row${rowNum}-col16`);
  col16Input.value = col16_val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const col17Input = document.getElementById(`row${rowNum}-col17`);
  col17Input.value = col17_val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const col18Input = document.getElementById(`row${rowNum}-col18`);
  col18Input.value = col18_val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Summary update
function updateSummary() {
  let sumCol = (col, decimalPlaces) => {
    let sum = 0;
    for (let row = 1; row <= 8; row++) {
      sum += parseFormattedNumber(document.getElementById(`row${row}-col${col}`).value);
    }
    return sum.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); // Always 0 decimal places
  };

  let sumColsRange = (fromCol, toCol, decimalPlaces) => {
    let sum = 0;
    for (let row = 1; row <= 8; row++) {
      for (let col = fromCol; col <= toCol; col++) {
        sum += parseFormattedNumber(document.getElementById(`row${row}-col${col}`).value);
      }
    }
    return sum.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); // Always 0 decimal places
  };

  document.getElementById('payableAmount').value = sumColsRange(10, 13, 0); // Changed to 0 decimal places
  document.getElementById('reducingAmount').value = sumCol(18, 0); // Changed to 0 decimal places
  document.getElementById('savingOffset').value = sumCol(9, 0);
  document.getElementById('cashCollection').value = sumCol(8, 0);
}

// Drag & Drop handlers
const dragDropBoxes = document.querySelectorAll('.drag-drop-box');
dragDropBoxes.forEach(box => {
  box.addEventListener('dragover', (e) => {
    e.preventDefault();
    box.classList.add('dragover');
  });
  box.addEventListener('dragleave', () => {
    box.classList.remove('dragover');
  });
  box.addEventListener('drop', (e) => {
    e.preventDefault();
    box.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (!files.length) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      // Changed alert to console.error as per guidelines.
      console.error('Please drop an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function(evt) {
      const existingImg = box.querySelector('img');
      if (existingImg) existingImg.remove();
      const img = document.createElement('img');
      img.src = evt.target.result;
      box.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
  box.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const existingImg = box.querySelector('img');
        if (existingImg) existingImg.remove();
        const img = document.createElement('img');
        img.src = evt.target.result;
        box.appendChild(img);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });
});

// Date formatting for PDF output
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
document.addEventListener('DOMContentLoaded', () => {
  // Set the "Date" input in the top-right table to today's date
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  document.getElementById('topRightTableDateInput').value = `${year}-${month}-${day}`;
});

function prepareInputsForPDF() {
  // Convert text inputs to spans
  const inputs = document.querySelectorAll('input:not([type="checkbox"])');
  inputs.forEach(input => {
    let value = input.value;
    if (input.type === 'date') {
      const dateObj = new Date(value);
      if (!isNaN(dateObj.getTime())) {
        value = formatDate(dateObj);
      } else {
        value = '';
      }
    }
    const span = document.createElement('span');
    span.textContent = value;
    // Copy styles for visual consistency in PDF
    span.style.display = input.style.display || 'inline-block';
    span.style.width = input.offsetWidth + 'px';
    span.style.height = input.offsetHeight + 'px';
    // Ensure padding, text-align, and white-space are copied from the input's computed style
    span.style.padding = window.getComputedStyle(input).padding;
    span.style.textAlign = window.getComputedStyle(input).textAlign;
    span.style.boxSizing = input.style.boxSizing || 'border-box';
    span.style.border = input.style.border || 'none';
    span.style.backgroundColor = input.style.backgroundColor || 'transparent';
    span.style.color = input.style.color || 'initial';
    // Changed to get the computed font-weight to ensure it's always bold
    span.style.fontWeight = window.getComputedStyle(input).fontWeight;
    span.style.fontSize = window.getComputedStyle(input).fontSize;
    span.style.whiteSpace = window.getComputedStyle(input).whiteSpace;
    span.style.overflow = window.getComputedStyle(input).overflow;


    // If an input had a red highlight, preserve it
    if (input.classList.contains('highlight-red')) {
      span.classList.add('highlight-red');
    }

    // Preserve content of drag-drop boxes if it's an image
    if (input.parentNode && input.parentNode.classList.contains('drag-drop-box')) {
      input.parentNode.replaceChild(span, input);
    } else {
      input.parentNode.replaceChild(span, input);
    }
  });

  // Handle select element for PDF: replace with a span containing selected text
  const teamSelect = document.getElementById('teamSelect');
  if (teamSelect) {
      const selectedOptionText = teamSelect.options[teamSelect.selectedIndex].text;
      const span = document.createElement('span');
      span.textContent = selectedOptionText;
      // Copy relevant styles for consistency
      span.style.display = 'block';
      span.style.width = '100%';
      span.style.height = '100%';
      span.style.textAlign = 'center';
      span.style.verticalAlign = 'middle';
      span.style.lineHeight = teamSelect.offsetHeight + 'px'; // Center text vertically
      span.style.fontWeight = 'bold'; // The cell is already bold, but good to be explicit

      teamSelect.parentNode.replaceChild(span, teamSelect);
  }

  // Hide the "Save as PDF" button
  const savePdfBtn = document.querySelector('.save-pdf-btn');
  if (savePdfBtn) {
    savePdfBtn.classList.add('hide-on-pdf');
  }

  // Convert checkboxes to visual checkbox symbols for PDF
  const checkboxes = document.querySelectorAll('input[type="checkbox"].purpose-checkbox'); // Target only purpose checkboxes
  checkboxes.forEach(checkbox => {
      const span = document.createElement('span');
      span.classList.add('pdf-checkbox');
      if (checkbox.checked) {
          span.classList.add('checked');
      }
      // Insert the new span before the text node (e.g., "Interest")
      const label = checkbox.parentNode;
      label.insertBefore(span, checkbox); // Insert before the actual checkbox input
      checkbox.style.display = 'none'; // Hide the original checkbox
  });

  // Populate the top-right date/time div for PDF
  const pdfHeaderDateTime = document.getElementById('pdfHeaderDateTime');
  if (pdfHeaderDateTime) {
    const now = new Date();
    const date = formatDate(now);
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    pdfHeaderDateTime.textContent = `Generated: ${date} ${time}`;
    pdfHeaderDateTime.style.display = 'block'; // Make it visible for PDF generation
  }

  // Prepare "Created by YYA" for PDF
  const createdByElement = document.querySelector('.created-by');
  if (createdByElement) {
      // Create a span to replace the div for PDF rendering, copying necessary styles
      const span = document.createElement('span');
      span.textContent = createdByElement.textContent;
      span.style.fontSize = window.getComputedStyle(createdByElement).fontSize;
      span.style.textAlign = window.getComputedStyle(createdByElement).textAlign;
      span.style.marginTop = window.getComputedStyle(createdByElement).marginTop;
      span.style.display = 'block'; // Ensure it takes up full width

      createdByElement.parentNode.replaceChild(span, createdByElement);
  }
}

function savePageAsPDF() {
  const savePdfBtn = document.querySelector('.save-pdf-btn');
  savePdfBtn.disabled = true; // Disable button during generation
  savePdfBtn.textContent = 'Generating PDF...'; // Provide feedback

  // Define A3 landscape dimensions and internal body margins (for PDF output)
  const a3Width = 16.54; // inches
  const a3Height = 11.69; // inches
  const bodyMargin = 0.5; // inches

  // Calculate effective content area within A3 page after considering body margins
  const contentWidth = a3Width - (2 * bodyMargin);
  const contentHeight = a3Height - (2 * bodyMargin);

  // Get the value from the specified input field (Col2 of row 2)
  const accIdInput = document.getElementById('row2-col2');
  let filename = 'approval_request_form'; // Default filename
  if (accIdInput && accIdInput.value.trim() !== '') {
      // Sanitize the input value for use as a filename
      // Replace invalid characters with an underscore, and remove leading/trailing spaces
      filename = accIdInput.value.trim().replace(/[^a-z0-9\-\_]/gi, '_');
      // Limit filename length to avoid issues on some OS (e.g., 255 chars)
      filename = filename.substring(0, 200);
  }
  filename += '.pdf'; // Add the .pdf extension

  // Prepare inputs for PDF (modifies the live DOM temporarily)
  prepareInputsForPDF();

  const element = document.body; // Use the live DOM after modification

  html2pdf()
    .set({
      margin:     0, // Let the x, y, width, height manage the layout
      filename:   filename, // Use the dynamically generated filename
      image:      { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:      { unit: 'in', format: 'a3', orientation: 'landscape' },
      // Set x, y, width, height for the content area on the PDF page
      x: bodyMargin,
      y: bodyMargin,
      width: contentWidth,
      height: contentHeight
    })
    .from(element)
    .save()
    .then(() => {
      // Revert the changes to the live DOM after PDF generation
      location.reload(); // Simple way to revert the DOM for the next interaction
    })
    .catch(error => {
      console.error('Error generating PDF:', error);
      // Replace alert with console.error as per guidelines.
      console.error('Failed to generate PDF. Please try again. Check console for details if issue persists.');
      // Revert button state even on error
      savePdfBtn.disabled = false;
      savePdfBtn.textContent = 'Save as PDF';
      // Reload to revert DOM changes, as prepareInputsForPDF modifies the live DOM
      location.reload();
    });
}