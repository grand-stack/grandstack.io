const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + "/siteConfig.js");

const docUrl = (doc, language) => {
  return siteConfig.baseUrl + "docs/" + doc;
};

const imgUrl = img => siteConfig.baseUrl + "img/" + img;

class Hackathon extends React.Component {
  render() {
    const steps = [
      {
        title: "Build something GRAND",
        content: `Build an application that uses the GRANDstack (GraphQL, React, Apollo, Neo4j Database). What you build is up to you but it should use all components of the GRANDstack.`,
        image: imgUrl("GrandStack-Logo-SiteIcon-512x512.png"),
        imageAlign: "top"
      },
      {
        title: "Tell us about it",
        content: `Add your project to the [GRANDstack HackDash board](https://hackdash.org/dashboards/grandstack). You have until June 30 to submit your project. Multiple team members are great, just be sure to add each member to the HackDash project.`,
        image: imgUrl("hackathon/logohack.png"),
        imageAlign: "top"
      },
      {
        title: "Win fun prizes and get featured",
        content: `We'll send a [BRIK lego style laptop cover](https://www.brik.co/) to the top 20 submissions as well as feature top projects during the GraphQL Europe closing keynote and a followup blog post.`,
        image: imgUrl("hackathon/prize.jpeg"),
        imageAlign: "top"
      }
    ];

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <header className="postHeader">
              <h1>GRANDstack Online Hackathon</h1>
              </header>
              <span>
              <p>
                Build a GRANDstack app during the month of <a href="https://www.graphql-europe.org/">GraphQL Europe</a> and
                win cool prizes
              </p>
              </span>
            

            <GridBlock
              contents={steps}
              layout="threeColumn"
              className="alignCenter"
            />

            <header className="postHeader">
              <h2>Resources</h2>
              <ul>
                <li>
                  The <a href="http://grandstack.io/docs/getting-started-grand-stack-starter.html">grand-stack-starter project</a> is a great way to quickly spin up a skeleton GRANDstack app.
                </li>
                <li>Use the <a href="http://grandstack.io/docs/neo4j-graphql-plugin.html">Neo4j-GraphQL plugin</a> to serve a GraphQL endpoint directly from Neo4j. </li>
                <li>Quickly spin up a free hosted Neo4j instance, choose from existing datasets with <a href="https://neo4j.com/sandbox-v2/"> Neo4j Sandbox.</a> </li>
                <li>See what others are doing on the <a href="https://blog.grandstack.io/">GRANDstack Blog.</a></li>
              </ul>

              <p><li>
                  Email <i>will@grandstack.io</i> with any questions
                </li></p>
            </header>
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Hackathon;
