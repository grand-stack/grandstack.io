import React from "react";
import GraphiQL from "graphiql";

const GraphiQLSnippet = ({ query, endpoint }) => {
  return (
    <GraphiQL
      fetcher={graphQLParams =>
        fetch(endpoint, {
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
