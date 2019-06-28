const React = require("react");
const CompLibrary = require("../../core/CompLibrary.js");
const Container = CompLibrary.Container;
const siteConfig = require(process.cwd() + "/siteConfig.js");

class Survey extends React.Component {
  render() {
    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <header className="postHeader">
              <h1>GRANDstack Survey</h1>
            </header>
            <span>
              <p>
                Help drive the direction of GRANDstack by giving us your
                feedback in this short form.
              </p>
            </span>

            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSeB2vbVItYzj9FC4JtkUnwfESg-h-NXKNAswa7AG39kZKxiLA/viewform?embedded=true"
              width="720"
              height="2148"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            >
              Loading...
            </iframe>
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Survey;
