// Função para iniciar o arrastar
const tags = document.querySelectorAll(".tag");
tags.forEach((tag) => {
  tag.addEventListener("dragstart", dragStart);
});

// Área de código onde as tags serão soltas
const codeArea = document.getElementById("code-area");
codeArea.addEventListener("dragover", allowDrop);
codeArea.addEventListener("drop", dropTag);
codeArea.addEventListener("dragleave", removeAnimation); // Remove a animação quando o arraste sai da área

function allowDrop(e) {
  e.preventDefault();
}
function dragStart(e) {
  e.dataTransfer.setData("text", e.target.getAttribute("data-tag"));

  // Adiciona a animação de borda tracejada ao arrastar
  const codeArea = document.getElementById("code-area");
  codeArea.classList.add("drop-area-animated");
}

// Função de arrastar tags para a área de código (atualiza números de linha)
function dropTag(e) {
  e.preventDefault();
  const tagCode = e.dataTransfer.getData("text");
  const codeOutput = document.getElementById("code-output");

  const tagDiv = document.createElement("div");
  tagDiv.classList.add("code-tag");
  tagDiv.innerText = tagCode;

  codeOutput.appendChild(tagDiv);

  // Atualiza a numeração de linhas
  updateLineNumbers();
}
// Remove a animação se o arraste sair da área de código sem soltar
function removeAnimation() {
  codeArea.classList.remove("drop-area-animated");
}

// Remove a animação ao término do arraste
document.addEventListener("dragend", function () {
  codeArea.classList.remove("drop-area-animated");
});
// Remover a animação de borda se o tag não for solto na área
tags.forEach((tag) => {
  tag.addEventListener("dragend", () => {
    codeArea.classList.remove("active");
  });
});

const validateButton = document.getElementById("validate-button");
validateButton.addEventListener("click", validateHTML);

function validateHTML() {
  const codeContainer = document.querySelector(".code-container");
  const codeOutput = document.getElementById("code-output");
  const codeTags = codeOutput.getElementsByClassName("code-tag");
  const resultDiv = document.getElementById("result");

  // Verifica se a área de código está vazia
  if (codeTags.length === 0) {
    resultDiv.innerHTML = `
    <div class="conjunto">
      <span class="material-symbols-rounded red">warning</span>
      <span style='color: red;'>A área de código está vazia! Insira algumas tags para validar.</span>    
    </div>
    `;

    // Aplica a animação de tremor quando está vazio
    codeContainer.classList.add("shake");
    setTimeout(() => {
      codeContainer.classList.remove("shake");
    }, 500); // Duração da animação

    resultDiv.style.display = "inline-flex"; // Exibe o resultDiv
    return; // Encerra a função aqui se a área estiver vazia
  }

  // Resetar as classes anteriores
  Array.from(codeTags).forEach((tag) => {
    tag.classList.remove("red"); // Remove a classe de erro
  });

  // Limpa a classe de animação anterior
  resultDiv.classList.remove("animation");

  // Tags autossuficientes (self-closing) que não precisam de fechamento
  const selfClosingTags = ["img", "input", "br", "hr", "meta", "link"];

  // Tags para verificar pares de abertura e fechamento
  const tags = [
    "html",
    "head",
    "body",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "a",
    "ul",
    "ol",
    "li",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "button",
  ];

  const stack = []; // Pilha para rastrear a ordem das tags abertas
  let isValid = true;
  let missingTags = [];

  // Verifica se as tags obrigatórias estão presentes
  let hasHTML = false;
  let hasHead = false;
  let hasBody = false;

  Array.from(codeTags).forEach((tag) => {
    const tagContent = tag.innerText.trim(); // Pegando o texto da tag para verificar
    let tagIsMatched = false;

    // Verifica se a tag é autossuficiente
    if (
      selfClosingTags.some((selfClosingTag) =>
        tagContent.startsWith(`<${selfClosingTag}`)
      )
    ) {
      tagIsMatched = true; // Autossuficiente, não precisa ser empilhada
    }

    tags.forEach((tagName) => {
      const openingTag = `<${tagName}>`;
      const closingTag = `</${tagName}>`;

      // Verificar se é uma tag de abertura
      if (tagContent === openingTag) {
        stack.push({ tagName, element: tag }); // Empilha a tag de abertura
        tagIsMatched = true;

        // Verifica tags obrigatórias
        if (tagName === "html") hasHTML = true;
        if (tagName === "head") hasHead = true;
        if (tagName === "body") hasBody = true;
      }

      // Verificar se é uma tag de fechamento
      if (tagContent === closingTag) {
        const lastOpened = stack.pop(); // Retira a última tag da pilha
        if (!lastOpened || lastOpened.tagName !== tagName) {
          isValid = false; // Se a tag não corresponde, é inválido
          tag.classList.add("red"); // Aplica a classe de erro
        }
        tagIsMatched = true;
      }
    });

    // Se a tag não é correspondente a nenhuma abertura ou fechamento esperada, e não é autossuficiente
    if (!tagIsMatched) {
      isValid = false;
      tag.classList.add("red"); // Aplica a classe de erro
    }
  });

  // Verificar se há tags abertas sem fechamento
  if (stack.length > 0) {
    isValid = false;
    stack.forEach((openTag) => {
      openTag.element.classList.add("red"); // Destaca as tags abertas que não foram fechadas
    });
  }

  // Exibir o resultado da validação
  if (isValid) {
    resultDiv.innerHTML = `
    <div class="conjunto">
      <span class="material-symbols-rounded green">new_releases</span> 
      <span class="green">HTML Válido!</span>    
    </div>
    `;

    // Verifica as tags obrigatórias e exibe sugestão se necessário
    if (!hasHTML || !hasHead || !hasBody) {
      missingTags = [];
      let explanations = "";

      if (!hasHTML) {
        missingTags.push("&lt;html&gt;");
        explanations += `
        <div class="conjunto">
          <span class="material-symbols-rounded yellow">info</span>
          <span class="yellow">A tag <code>&lt;html&gt;</code> é obrigatória porque ela define o início e o fim do documento HTML. Todo o conteúdo deve estar dentro dessa tag.</span>
        </div>`;
      }
      if (!hasHead) {
        missingTags.push("&lt;head&gt;");
        explanations += `
        <div class="conjunto">
          <span class="material-symbols-rounded yellow">info</span>
          <span class="yellow">A tag <code>&lt;head&gt;</code> é obrigatória porque ela contém metadados, como o título da página, links para arquivos CSS e scripts importantes para o navegador.</span>
        </div>`;
      }
      if (!hasBody) {
        missingTags.push("&lt;body&gt;");
        explanations += `
        <div class="conjunto">
          <span class="material-symbols-rounded yellow">info</span>
          <span class="yellow">A tag <code>&lt;body&gt;</code> é obrigatória porque todo o conteúdo visível da página deve estar dentro dela.</span>
        </div>`;
      }

      resultDiv.innerHTML += `
      <br>
      <div class="conjunto">
        <span class="material-symbols-rounded yellow">info</span> 
        <span class="yellow">Sugestão: Adicione as tags obrigatórias: ${missingTags.join(
          ", "
        )}</span>  
      </div>
      ${explanations}
      `;
    }

    // Explosão de confetes na área de código
    party.confetti(codeOutput, {
      count: party.variation.range(20, 40), // Quantidade de confetes
      spread: 60, // Largura da dispersão dos confetes
    });
  } else {
    resultDiv.innerHTML = `
      <span class="material-symbols-rounded red">warning</span> 
      <span class="red">HTML Inválido! Verifique as tags destacadas em vermelho.</span>`;

    // Adiciona o efeito de tremor se inválido
    codeContainer.classList.add("shake");

    // Remove a classe de tremor após a animação
    setTimeout(() => {
      codeContainer.classList.remove("shake");
    }, 500); // Duração da animação
  }

  // Torna o result visível
  resultDiv.style.display = "inline-flex";
  // Adiciona a classe de animação ao resultado
  resultDiv.classList.add("animation");
}

// Atualiza a numeração de linhas com base no conteúdo
function updateLineNumbers() {
  const codeOutput = document.getElementById("code-output");
  const lineNumbers = document.getElementById("line-numbers");

  // Limpa a numeração existente
  lineNumbers.innerHTML = "";

  // Conta o número de linhas. Garante que haverá pelo menos 1 linha, mesmo se o campo estiver vazio.
  const lines = codeOutput.innerText.split("\n").length;

  // Atualiza a numeração de linhas, sempre começando a partir de 1
  const totalLines = Math.max(lines, 1); // Garante pelo menos 1 linha

  for (let i = 1; i <= totalLines; i++) {
    const lineNumber = document.createElement("div");
    lineNumber.textContent = i;
    lineNumbers.appendChild(lineNumber);
  }
}

// Função para iniciar o arrastar
document
  .getElementById("validate-button")
  .addEventListener("click", updateLineNumbers);
// Adicionar numeração de linhas ao iniciar e a cada modificação

document.getElementById("clear-button").addEventListener("click", () => {
  document.getElementById("code-output").innerHTML = "";
  updateLineNumbers();
});

// Função para mostrar o pop-up por alguns segundos
function showActionPopover(actionText) {
  const popover = document.getElementById("action-popover");
  popover.innerText = actionText; // Define o texto do popover
  popover.classList.add("show"); // Adiciona a classe "show"

  // Remove o popover após um tempo
  setTimeout(() => {
    popover.classList.remove("show"); // Remove a classe "show" para ocultar
  }, 2000); // Exibe o popover por 2 segundos
}

// Função para limpar a área de código
const clearButton = document.getElementById("clear-button");
clearButton.addEventListener("click", clearAllTags);

let redoStack = [];
let actionStack = [];

// Function to undo the last action (example for undoing last tag drop)
function undoLastAction() {
  const codeOutput = document.getElementById("code-output");

  // Get the last tag added
  const lastTag = codeOutput.lastElementChild;

  // Remove the last tag if it exists and push it to the redo stack
  if (lastTag) {
    redoStack.push(lastTag.outerHTML);
    codeOutput.removeChild(lastTag);
  }
  showActionPopover("Desfeito");
}

// Function to redo the last undone action
function redoLastAction() {
  const codeOutput = document.getElementById("code-output");

  // Check if there's anything to redo
  if (redoStack.length > 0) {
    const lastUndoneTag = redoStack.pop();

    // Create a new element from the stored HTML string and append it
    const newTag = document.createElement("div");
    newTag.innerHTML = lastUndoneTag;

    // Append the redone tag to the code area
    codeOutput.appendChild(newTag.firstChild);
  }
  showActionPopover("Refeito");
}

// Function to clear all tags from the code area and reset #result content
function clearAllTags() {
  const codeOutput = document.getElementById("code-output");
  const resultDiv = document.getElementById("result");

  // Clear all tags from the code output
  codeOutput.innerHTML = "";

  // Reset the result content and hide it
  resultDiv.innerHTML = "";
  resultDiv.style.display = "none";

  // Update the line numbers
  updateLineNumbers();

  showActionPopover("Todas as tags foram limpas");
}

// Undo and Redo Button Event Listeners
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");

undoBtn.addEventListener("click", undoLastAction); // Call undo on button click
redoBtn.addEventListener("click", redoLastAction); // Call redo on button click

// Atualizar os números de linha ao carregar a página
window.onload = updateLineNumbers;

// Event listener for keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Check if Ctrl + Z is pressed for undo
  if (e.ctrlKey && e.key === "z") {
    undoLastAction();
  }

  // Check if Ctrl + Y is pressed for redo
  if (e.ctrlKey && e.key === "y") {
    redoLastAction();
  }

  // Check if Ctrl + Shift + X is pressed to clear all tags
  if (e.ctrlKey && e.shiftKey && e.key === "X") {
    clearAllTags();
  }
  if (e.ctrlKey && e.key === "c") {
    copyCodeToClipboard();
  }
  if (e.ctrlKey && e.key === "v") {
    e.preventDefault(); // Prevent the default paste behavior
    pasteCodeFromClipboard();
  }
});
// Add click event listener to the copy button
document
  .getElementById("copy-button")
  .addEventListener("click", copyCodeToClipboard);
document
  .getElementById("paste-button")
  .addEventListener("click", pasteCodeFromClipboard);

// Function to validate if the content is valid HTML tags
function isValidHTMLContent(text) {
  const htmlTagPattern = /<\/?[\w\s="/.':;#-\/\?]+>/gi;
  return htmlTagPattern.test(text);
}

// Function to copy content from the code area to the clipboard
function copyCodeToClipboard() {
  const codeOutput = document.getElementById("code-output");

  // Create a temporary textarea element to hold the code
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = codeOutput.innerText; // Get the text inside the code output

  // Append the textarea to the document to enable copying
  document.body.appendChild(tempTextArea);

  // Select and copy the text
  tempTextArea.select();
  document.execCommand("copy");

  // Remove the temporary textarea
  document.body.removeChild(tempTextArea);

  // Optional: Show a message or notification indicating successful copy
  showActionPopover("Conteúdo copiado para o clipboard!");
}

// Function to paste content from the clipboard into the code area
async function pasteCodeFromClipboard() {
  const codeOutput = document.getElementById("code-output");

  try {
    // Get clipboard text content
    const clipboardText = await navigator.clipboard.readText();

    // Validate if the clipboard content is valid HTML
    if (!isValidHTMLContent(clipboardText)) {
      showActionPopover(
        "O conteúdo colado não é válido! Por favor, cole apenas tags HTML."
      );
      return;
    }

    // Split the pasted content into individual lines (if multiline input) and create divs for each
    const lines = clipboardText.split("\n");

    lines.forEach((line) => {
      const tagDiv = document.createElement("div");
      tagDiv.classList.add("code-tag");
      tagDiv.innerText = line.trim(); // Trim any extra whitespace from each line
      codeOutput.appendChild(tagDiv);
    });

    // Update line numbers after pasting
    updateLineNumbers();

    // Optional: Show a message or notification indicating successful paste
    showActionPopover("Conteúdo colado com sucesso!");
  } catch (err) {
    console.error("Failed to read clipboard contents: ", err);
  }
}
