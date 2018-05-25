/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + "/siteConfig.js");

function imgUrl(img) {
  return siteConfig.baseUrl + "img/" + img;
}

function docUrl(doc, language) {
  return siteConfig.baseUrl + "docs/" + (language ? language + "/" : "") + doc;
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? language + "/" : "") + page;
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: "_self"
};

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
);

const Logo = props => (
  <div className="projectLogo">
    <img src={props.img_src} />
  </div>
);

const ProjectTitle = props => (
  <h2 className="projectTitle">
    {siteConfig.title}
    <small>{siteConfig.tagline}</small>
  </h2>
);

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

class HomeSplash extends React.Component {
  render() {
    let language = this.props.language || "";
    return (
      <SplashContainer>
        <Logo img_src={imgUrl("GrandStack-Logo-SiteIcon-512x512.png")} />
        <div className="inner">
          <ProjectTitle />
          <PromoSection>
            {/* <Button href="#try">Try It Out</Button> */}
            <Button href={docUrl("links.html", language)}>Learn More</Button>
            {/* <Button href={docUrl('doc2.html', language)}>Example Link 2</Button> */}
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

const Block = props => (
  <Container
    padding={["bottom", "top"]}
    id={props.id}
    background={props.background}
  >
    <GridBlock align="center" contents={props.children} layout={props.layout} />
  </Container>
);

const Features = props => (
  <Block layout="fourColumn">
    {[
      {
        content: "",
        image: imgUrl("logo/graphql.svg"),
        imageAlign: "top",
        title: "GraphQL"
      },
      {
        content: "",
        image: imgUrl("logo/react.svg"),
        imageAlign: "top",
        title: "React"
      },
      {
        content: "",
        image: imgUrl("logo/apollo.svg"),
        imageAlign: "top",
        title: "Apollo"
      },
      {
        content: "",
        image: imgUrl("logo/neo4j.svg"),
        imageAlign: "top",
        title: "Neo4j Database"
      }
    ]}
  </Block>
);

const FeatureCallout = props => (
  <div
    className="productShowcaseSection paddingBottom"
    style={{ textAlign: "center" }}
  >
    <h2>Modern tools for building full stack apps</h2>
    <MarkdownBlock>
      Leverage developer productivity by using tools that just work together.
    </MarkdownBlock>
  </div>
);

const GraphQL = props => (
  <div className="container darkBackground paddingBottom paddingTop">
    <div className="wrapper">
      <div className="gridBlock">
        <div className="blockElement imageAlignSide imageAlignRight twoByGridBlock">
          <div className="blockContent">
            <h1>
              <div>
                <span>
                  <p>GraphQL</p>
                </span>
              </div>
            </h1>

            <div>
              <span>
                <p>
                  {" "}
                  A new paradigm for building APIs, GraphQL is a way of
                  describing data and enabling clients to query it.
                </p>
              </span>
            </div>

            <h2>
              <div>
                <span>
                  <p>GraphQL First Development</p>
                </span>
              </div>
            </h2>

            <div>
              <span>
                <p>
                  Describe your API by defining types and available queries in a
                  schema. Clients request only the data they need, nothing more.
                </p>
              </span>
            </div>

            <h2>
              <div>
                <span>
                  <p>Your Application Data Is A Graph </p>
                </span>
              </div>
            </h2>

            <div>
              <span>
                <p>
                  Use GraphQL to model and query your application data as a
                  graph.
                </p>
              </span>
            </div>
          </div>

          <div className="blockImage">
            <img
              src={imgUrl("/logo/graphql.svg")}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);


const ReactSlide = props => (
  <div className="container lightBackground paddingBottom paddingTop">
    <div className="wrapper">
      <div className="gridBlock">
        <div className="blockElement imageAlignSide imageAlignLeft twoByGridBlock">

        <div className="blockImage">
            <img
              src={imgUrl("/logo/react.svg")}
            />
          </div>

          <div className="blockContent">
            <h1>
              <div>
                <span>
                  <p>React</p>
                </span>
              </div>
            </h1>

            <div>
              <span>
                <p>
                  A JavaScript library for building user interfaces.
                </p>
              </span>
            </div>

            <h2>
              <div>
                <span>
                  <p>Component Based UI</p>
                </span>
              </div>
            </h2>

            <div>
              <span>
                <p>
                  Build reusable and composable user interface components. React components encapsulate data and state and can be composed for building complex user interfaces.
                </p>
              </span>
            </div>

            <h2>
              <div>
                <span>
                  <p>Declarative User Interface Design</p>
                </span>
              </div>
            </h2>

            <div>
              <span>
                <p>
                  Design views for data and React handles re-rendering your interface when application data changes.
                </p>
              </span>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  </div>
);

const Apollo = props => (
  <div className="container darkBackground paddingBottom paddingTop">
    <div className="wrapper">
      <div className="gridBlock">
        <div className="blockElement imageAlignSide imageAlignRight twoByGridBlock">
          <div className="blockContent">
            <h1>
              <div>
                <span>
                  <p>Apollo</p>
                </span>
              </div>
            </h1>

            <div>
              <span>
                <p>
                  A suite of tools that work together to create great GraphQL workflows.
                </p>
              </span>
            </div>

            <h2>
              <div>
                <span>
                  <p>Great GraphQL Workflows</p>
                </span>
              </div>
            </h2>

            <div>
              <span>
                <p>
                Query GraphQL APIs using Apollo Client frontend framework integrations. Server side tooling enables GraphQL schema generation and performance monitoring
                </p>
              </span>
            </div>

            <h2>
              <div>
                <span>
                  <p>Consistent Developer Experience</p>
                </span>
              </div>
            </h2>

            <div>
              <span>
                <p>
                Consistent tooling across server-side and client-side development.
                </p>
              </span>
            </div>
          </div>

          <div className="blockImage">
            <img
              src={imgUrl("/logo/apollo.svg")}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Neo4jDatabase = props => (
  <div className="container lightBackground paddingBottom paddingTop">
    <div className="wrapper">
      <div className="gridBlock">
        <div className="blockElement imageAlignSide imageAlignLeft twoByGridBlock">

        <div className="blockImage">
            <img
              src={imgUrl("/logo/neo4j.svg")}
            />
          </div>

          <div className="blockContent">
            <h1>
              <div>
                <span>
                  <p>Neo4j Database</p>
                </span>
              </div>
            </h1>

            <div>
              <span>
                <p>
                  The open source native graph database.
                </p>
              </span>
            </div>

            <h2>
              <div>
                <span>
                  <p>Native Graph Database</p>
                </span>
              </div>
            </h2>

            <div>
              <span>
                <p>
                Model, store, and query your data the same way you think about it: as a graph. 
                </p>
              </span>
            </div>

            <h2>
              <div>
                <span>
                  <p>Near Real Time Query Performance With Index-Free Adjacency</p>
                </span>
              </div>
            </h2>

            <div>
              <span>
                <p>
                Express complex graph traversals using the Cypher query language.                </p>
              </span>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  </div>
);

const LearnHow = props => (
  <Block background="light">
    {[
      {
        content: "Talk about learning how to use this",
        image: imgUrl("docusaurus.svg"),
        imageAlign: "right",
        title: "Learn How"
      }
    ]}
  </Block>
);

const TryOut = props => (
  <Block id="try">
    {[
      {
        content: "Talk about trying this out",
        image: imgUrl("docusaurus.svg"),
        imageAlign: "left",
        title: "Try it Out"
      }
    ]}
  </Block>
);

const Description = props => (
  <Block background="dark">
    {[
      {
        content: "This is another description of how this project is useful",
        image: imgUrl("docusaurus.svg"),
        imageAlign: "right",
        title: "Description"
      }
    ]}
  </Block>
);

const Showcase = props => {
  if ((siteConfig.users || []).length === 0) {
    return null;
  }
  const showcase = siteConfig.users
    .filter(user => {
      return user.pinned;
    })
    .map((user, i) => {
      return (
        <a href={user.infoLink} key={i}>
          <img src={user.image} alt={user.caption} title={user.caption} />
        </a>
      );
    });

  return (
    <div className="productShowcaseSection paddingBottom">
      <h2>{"Who's Using This?"}</h2>
      <p>This project is used by all these people</p>
      <div className="logos">{showcase}</div>
      <div className="more-users">
        <a className="button" href={pageUrl("users.html", props.language)}>
          More {siteConfig.title} Users
        </a>
      </div>
    </div>
  );
};

class Index extends React.Component {
  render() {
    let language = this.props.language || "";

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Features />
          <FeatureCallout />
          <GraphQL />
          <ReactSlide />
          <Apollo />
          <Neo4jDatabase />
          {/* <LearnHow />
          <TryOut />
          <Description /> */}
          {/* <Showcase language={language} /> */}
        </div>
      </div>
    );
  }
}

module.exports = Index;
