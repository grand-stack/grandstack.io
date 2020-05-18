import React from "react";
import GraphiQL from "graphiql";

const GraphiQLSnippet = ({ query }) => {
  return (
    <GraphiQL
      fetcher={graphQLParams =>
        fetch("https://movies.grandstack.io", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(graphQLParams)
        })
          .then(response => response.json())
          .catch(() => response.text())
      }
      query={query}
    />
  );
};

export default GraphiQLSnippet;
