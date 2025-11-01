/**
 * Interface for a Lexical text node
 */
interface LexicalTextNode {
  type: string;
  text?: string;
  children?: LexicalNode[];
}

/**
 * Interface for a Lexical linebreak node
 */
interface LexicalLinebreakNode {
  type: string;
  children?: LexicalNode[];
}

/**
 * Union type for all possible Lexical node types
 */
type LexicalNode = LexicalTextNode | LexicalLinebreakNode;

/**
 * Interface for the root node of Lexical content
 */
interface LexicalRootNode {
  type: string;
  children: LexicalNode[];
}

/**
 * Interface for Lexical content structure
 */
interface LexicalContent {
  root?: LexicalRootNode;
  description?: {
    root: LexicalRootNode;
  };
}

/**
 * Converts Lexical editor JSON content to plain text
 * @param lexicalJson - The Lexical editor JSON content
 * @returns Plain text representation
 */
function lexicalJsonToPlainText(lexicalJson: LexicalContent | string): string {
  // If the input is a string (already stringified JSON), parse it
  const content: LexicalContent =
    typeof lexicalJson === "string" ? JSON.parse(lexicalJson) : lexicalJson;

  // Get the root node
  const rootNode: LexicalRootNode | undefined =
    content.root || content.description?.root;

  if (!rootNode || !rootNode.children) {
    return "";
  }

  // Process all children nodes and concatenate the result
  let plainText = "";

  // Function to process nodes recursively
  function processNode(node: LexicalNode | undefined): string {
    if (!node) return "";

    let nodeText = "";

    // Process text nodes
    if (node.type === "text" && "text" in node && node.text) {
      nodeText += node.text;
    }

    // Process linebreaks
    if (node.type === "linebreak") {
      nodeText += " ";
    }

    // Process children nodes recursively
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        nodeText += processNode(child);
      }
    }

    return nodeText;
  }

  // Process each paragraph
  for (const paragraph of rootNode.children) {
    const paragraphText = processNode(paragraph);

    // Add space between paragraphs
    if (plainText && paragraphText) {
      plainText += " ";
    }

    plainText += paragraphText;
  }

  // Clean up any multiple spaces and trim
  return plainText.replace(/\s+/g, " ").trim();
}

export { lexicalJsonToPlainText };
