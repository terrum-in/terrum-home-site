const renderLexicalContent = (
  nodes: any[],
  linkColor: string = "text-blue-500"
): JSX.Element[] | null => {
  return nodes.map((node, index) => {
    if (node.type === "text") {
      return node.text;
    }

    if (node.type === "paragraph") {
      return (
        <p key={index} className="mb-2">
          {renderLexicalContent(node.children || [], linkColor)}
        </p>
      );
    }

    if (node.type === "link") {
      return (
        <a
          key={index}
          href={node.fields.url}
          target={node.fields.newTab ? "_blank" : "_self"}
          rel={node.fields.newTab ? "noopener noreferrer" : undefined}
          className={`${linkColor} underline`}
        >
          {renderLexicalContent(node.children || [], linkColor)}
        </a>
      );
    }

    if (node.type === "list") {
      if (node.listType === "check") {
        return (
          <ul key={index} className="ml-5 space-y-1">
            {renderLexicalContent(node.children || [], linkColor)}
          </ul>
        );
      }

      const ListTag = node.listType === "number" ? "ol" : "ul";
      const listStyle =
        node.listType === "number" ? "list-decimal" : "list-disc";

      return (
        <ListTag key={index} className={`ml-5 ${listStyle} list-inside`}>
          {renderLexicalContent(node.children || [], linkColor)}
        </ListTag>
      );
    }

    if (node.type === "listitem") {
      if (node.checked !== undefined) {
        return (
          <li key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={node.checked}
              readOnly
              className="mr-2"
            />
            {renderLexicalContent(node.children || [], linkColor)}
          </li>
        );
      }

      return (
        <li key={index}>
          {renderLexicalContent(node.children || [], linkColor)}
        </li>
      );
    }

    if (node.type === "heading") {
      const HeadingTag = node.tag || "h1";
      const headingStyles = {
        h1: "text-3xl font-bold",
        h2: "text-2xl font-bold",
        h3: "text-xl font-bold",
        h4: "text-lg font-semibold",
        h5: "text-base font-semibold",
        h6: "text-sm font-semibold",
      };

      return (
        <HeadingTag
          key={index}
          className={
            headingStyles[node.tag as keyof typeof headingStyles] || "font-bold"
          }
        >
          {renderLexicalContent(node.children || [], linkColor)}
        </HeadingTag>
      );
    }

    if (node.type === "quote") {
      return (
        <blockquote
          key={index}
          className="border-l-4 pl-3 italic text-gray-700"
        >
          {renderLexicalContent(node.children || [], linkColor)}
        </blockquote>
      );
    }

    if (node.type === "horizontalrule") {
      return <hr key={index} className="my-4 border-gray-300" />;
    }

    return null;
  });
};

export default renderLexicalContent;
