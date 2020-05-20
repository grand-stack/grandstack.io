import React, { Component } from "react";

class FeedbackWidget extends Component {
  constructor(props) {
    super(props);

    this.state = {
      helpful: false,
      url: "",
      reason: "missing",
      moreInfo: "",
      submitted: false,
      showForm: true,
      formState: 0 // 0 = not yet filled out 2 = no 3 = submitted
    };

    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.handleYesClick = this.handleYesClick.bind(this);
    this.handleNoClick = this.handleNoClick.bind(this);
    this.onReasonChanged = this.onReasonChanged.bind(this);
    this.moreInfoChanged = this.moreInfoChanged.bind(this);
    this.handleSkipClick = this.handleSkipClick.bind(this);
  }

  handleSubmitClick() {
    const buildMoreParams = () => {
      return !this.state.skip
        ? `&reason=${this.state.reason}&moreInformation=${escape(
            this.state.moreInfo
          )}`
        : "";
    };

    this.setState({ formState: 3 }, () => {
      fetch(
        "https://uglfznxroe.execute-api.us-east-1.amazonaws.com/dev/Feedback",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "content-type: application/x-www-form-urlencoded; charset=UTF-8"
          },
          body: `url=${encodeURIComponent(window.location.href)}&helpful=${
            this.state.helpful
          }${buildMoreParams()}`
        }
      );
    });
  }

  handleSkipClick() {
    this.setState({ skip: true }, () => this.handleSubmitClick());
  }

  handleNoClick() {
    this.setState({ helpful: false, formState: 2 });
  }

  handleYesClick() {
    this.setState({ helpful: true }, () => this.handleSubmitClick());
  }

  onReasonChanged(e) {
    this.setState({ reason: e.target.value });
  }

  moreInfoChanged(e) {
    this.setState({ moreInfo: e.target.value });
  }

  render() {
    const { formState, showForm } = this.state;
    if (!showForm) return null;

    return (
      <div class="feedback-card">
        <div class="card">
          <div class="card__header">
            <h3 className="text--center">
              Was the content on this page helpful?
            </h3>
          </div>

          {formState === 0 && (
            <div class="card__footer text--center">
              <div class="button-group button-group-block">
                <button
                  className="button button--secondary"
                  onClick={this.handleNoClick}
                >
                  No
                </button>
                <button
                  className="button button--secondary"
                  onClick={this.handleYesClick}
                >
                  Yes
                </button>
              </div>
            </div>
          )}
          {formState === 2 && (
            <div class="card__body">
              <h4>Thanks for your feedback. How can we improve this page?</h4>
              <form>
                <div>
                  <input
                    type="radio"
                    data-reason="missing"
                    name="specific"
                    value="missing"
                    id="missing"
                    onChange={this.onReasonChanged}
                    checked={this.state.reason === "missing"}
                    style={{ verticalAlign: "middle" }}
                  />
                  <label for="missing">It has missing information</label>
                </div>

                <div>
                  <input
                    type="radio"
                    data-reason="hard-to-follow"
                    name="specific"
                    value="hard-to-follow"
                    id="hard-to-follow"
                    onChange={this.onReasonChanged}
                    checked={this.state.reason === "hard-to-follow"}
                    style={{ verticalAlign: "middle" }}
                  />
                  <label for="hard-to-follow">
                    It's hard to follow or confusing
                  </label>
                </div>

                <div>
                  <input
                    type="radio"
                    data-reason="inaccurate"
                    name="specific"
                    value="inaccurate"
                    id="inaccurate"
                    onChange={this.onReasonChanged}
                    checked={this.state.reason === "inaccurate"}
                    style={{ verticalAlign: "middle" }}
                  />
                  <label for="inaccurate">
                    It's inaccurate, out of date, or doesn't work
                  </label>
                </div>

                <div>
                  <input
                    type="radio"
                    data-reason="other"
                    name="specific"
                    value="other"
                    id="other-reason"
                    onChange={this.onReasonChanged}
                    checked={this.state.reason === "other"}
                    style={{ verticalAlign: "middle" }}
                  />
                  <label for="other-reason">
                    It has another problem not covered by the above
                  </label>
                </div>

                <div style={{ paddingTop: "5px" }}>
                  <p>
                    <label for="more-information">More information</label>{" "}
                  </p>
                  <textarea
                    type="text"
                    rows="3"
                    cols="50"
                    name="more-information"
                    onChange={this.moreInfoChanged}
                  ></textarea>
                </div>

                <div
                  style={{ padding: "10px 0 10px 0" }}
                  class="submit-extra-feedback text--center"
                >
                  <div class="button-group button-group-block">
                    <button
                      className="button button--secondary"
                      onClick={this.handleSubmitClick}
                    >
                      Submit Feedback
                    </button>
                    <button
                      className="button button--secondary"
                      onClick={this.handleSkipClick}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {formState === 3 && (
            <div class="card__body">
              <p>
                Thanks for your feedback! It's helps us to improve the
                documentation.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default FeedbackWidget;
