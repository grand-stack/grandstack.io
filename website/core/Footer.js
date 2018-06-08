/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;

    // don't use language
    //return baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
    return baseUrl + "docs/" + doc;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? language + "/" : "") + doc;
  }

  render() {
    const currentYear = new Date().getFullYear();
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl("getting-started.html", this.props.language)}>
              Getting Started
            </a>
            <a href={this.docUrl("neo4j-graphql.html", this.props.language)}>
              Neo4j-GraphQL
            </a>
            <a href={this.docUrl("links.html", this.props.language)}>
              Resources
            </a>
          </div>
          <div>
            {/* <h5>Community</h5>
            <a href={this.pageUrl('users.html', this.props.language)}>
              User Showcase
            </a>
            <a
              href="http://stackoverflow.com/questions/tagged/"
              target="_blank"
              rel="noreferrer noopener">
              Stack Overflow
            </a>
            <a href="https://discordapp.com/">Project Chat</a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer noopener">
              Twitter
            </a> */}
          </div>
          <div>
            <h5>More</h5>
            <a href="https://blog.grandstack.io">Blog</a>
            <a href="https://github.com/grand-stack">GitHub</a>
            {/* <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/facebook/docusaurus/stargazers"
              data-show-count={true}
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub">
              Star
            </a> */}
          </div>
        </section>

        <a
          href="https://grandstack.io/"
          target="_blank"
          rel="noreferrer noopener"
          className="fbOpenSource"
        >
          <img
            src={
              this.props.config.baseUrl + "img/GrandStack-Logo-1Color_White.png"
            }
            alt="GRANDstack"
            width="170"
            height="45"
          />
        </a>
        <section className="copyright">
          <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
            <img
              alt="Creative Commons License"
              style={{borderWidth:0}}
              src="https://i.creativecommons.org/l/by/4.0/88x31.png"
            />
          </a>
          <br />This work is licensed under a {" "}
          <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
            Creative Commons Attribution 4.0 International License
          </a>.
        </section>
      </footer>
    );
  }
}

module.exports = Footer;
