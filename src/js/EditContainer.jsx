import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import StoryCard from './Container.jsx';
import JSONSchemaForm from '../../lib/js/react-jsonschema-form';

export default class EditStoryCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 1,
      dataJSON: {
        card_data: {},
        configs: {}
      },
      mode: "16_col",
      loading: true,
      publishing: false,
      uiSchemaJSON: {},
      schemaJSON: undefined,
      optionalConfigJSON: {},
      optionalConfigSchemaJSON: undefined,
      refLinkDetails: undefined
    }
    this.refLinkSourcesURL = window.ref_link_sources_url;
    this.toggleMode = this.toggleMode.bind(this);
  }

  exportData() {
    let getDataObj = {
      step: this.state.step,
      dataJSON: this.state.dataJSON.card_data,
      schemaJSON: this.state.schemaJSON,
      optionalConfigJSON: this.state.dataJSON.configs,
      optionalConfigSchemaJSON: this.state.optionalConfigSchemaJSON
    }
    getDataObj["name"] = getDataObj.dataJSON.data.title.substr(0,225); // Reduces the name to ensure the slug does not get too long
    return getDataObj;
  }

  componentDidMount() {
    if (typeof this.props.dataURL === "string"){
      axios.all([axios.get(this.props.dataURL), axios.get(this.props.schemaURL), axios.get(this.props.optionalConfigURL), axios.get(this.props.optionalConfigSchemaURL), axios.get(this.refLinkSourcesURL)])
        .then(axios.spread((card, schema, opt_config, opt_config_schema, linkSources) => {
          this.setState({
            dataJSON: {
              card_data: card.data,
              configs: opt_config.data
            },
            schemaJSON: schema.data,
            optionalConfigJSON: opt_config.data,
            optionalConfigSchemaJSON: opt_config_schema.data,
            refLinkDetails:linkSources.data
          });
          if (links.length) {
            this.checkAndUpdateLinkInfo(links, stateVars.refLinkDetails);
          }
        }))
        .catch((error) => {
          this.setState({
            errorOnFetchingData: true
          })
        });
    }
  }

  onChangeHandler({formData}) {
    switch (this.state.step) {
      case 1:
        this.setState((prevStep, prop) => {
          let dataJSON = prevStep.dataJSON;
          dataJSON.card_data = formData
          return {
            dataJSON: dataJSON
          }
        })
        break;
      case 2:
        this.setState((prevStep, prop) => {
          let dataJSON = prevStep.dataJSON;
          dataJSON.configs = formData
          return {
            dataJSON: dataJSON
          }
        })
        break;
    }
  }

  onSubmitHandler({formData}) {
    switch(this.state.step) {
      case 1:
        this.setState({
          step: 2
        });
        break;
      case 2:
        if (typeof this.props.onPublishCallback === "function") {
          this.setState({ publishing: true });
          let publishCallback = this.props.onPublishCallback();
          publishCallback.then((message) => {
            this.setState({ publishing: false });
          });
        }
        break;
    }
  }
  checkAndUpdateLinkInfo(links, refLinkDetails) {
    links.forEach((e,i) => {
      let linkDetails = this.lookUpLinkDetail(e.link, refLinkDetails);
      if (linkDetails) {
        e.favicon_url = linkDetails.favicon_url;
        e.publication_name = linkDetails.name;
      }
    });
  }

  lookUpLinkDetail(link, refLinkDetails) {
    refLinkDetails = refLinkDetails || this.state.refLinkDetails;

    let linkParams = this.parseUrl(link),
      lookupLink = refLinkDetails.filter((e, i) => {
        return e.url === linkParams.origin;
      })[0];

      return lookupLink;
  }

  renderSEO() {
    let seo_blockquote = `<blockquote><h3>${this.state.dataJSON.card_data.data.title}</h3><p>${this.state.dataJSON.card_data.data.description}</p></blockquote>`
    return seo_blockquote;
  }


  renderSchemaJSON() {
    // console.log(this.state.schemaJSON, "this.state.schemaJSON")
    switch(this.state.step){
      case 1:
        return this.state.schemaJSON;
        break;
      case 2:
        return this.state.optionalConfigSchemaJSON;
        break;
    }
  }

  renderFormData() {
    switch(this.state.step) {
      case 1:
        return this.state.dataJSON.card_data;
        break;
      case 2:
        return this.state.dataJSON.configs;
        break;
    }
  }

  showLinkText() {
    switch(this.state.step) {
      case 1:
        return '';
        break;
      case 2:
        return '< Back';
        break;
    }
  }

  showButtonText() {
    switch(this.state.step) {
      case 1:
        return 'Next';
        break;
      case 2:
        return 'Publish';
        break;
    }
  }

  onPrevHandler() {
    let prev_step = --this.state.step;
    this.setState({
      step: prev_step
    });
  }

  toggleMode(e) {
    let element = e.target.closest('a'),
      mode = element.getAttribute('data-mode');
    this.setState((prevState, props) => {
      let newMode;
      if (mode !== prevState.mode) {
        newMode = mode;
      } else {
        newMode = prevState.mode
      }
      return {
        mode: newMode
      }
    })
  }

  render() {
    if (this.state.schemaJSON === undefined) {
      return(<div>Loading</div>)
    } else {
      return (
        <div className="proto-container">
          <div className="ui grid form-layout">
            <div className="row">
              <div className="four wide column proto-card-form">
                <div>
                  <div className="section-title-text">Fill the form</div>
                  <div className="ui label proto-pull-right">
                    toStory
                  </div>
                </div>
                <JSONSchemaForm schema={this.renderSchemaJSON()}
                  onSubmit={((e) => this.onSubmitHandler(e))}
                  onChange={((e) => this.onChangeHandler(e))}
                  formData={this.renderFormData()}
                  >
                  <a id="protograph-prev-link" className={`${this.state.publishing ? 'protograph-disable' : ''}`} onClick={((e) => this.onPrevHandler(e))}>{this.showLinkText()} </a>
                  <button type="submit" className={`${this.state.publishing ? 'ui primary loading disabled button' : ''} default-button protograph-primary-button`}>{this.showButtonText()}</button>
                </JSONSchemaForm>
              </div>
              <div className="twelve wide column proto-card-preview proto-share-card-div">
                <div className="protograph-menu-container">
                  <div className="ui compact menu">
                    <a className={`item ${this.state.mode === '16_col' ? 'active' : ''}`}
                      data-mode='16_col'
                      onClick={this.toggleMode}
                    >
                      col-16
                    </a>
                    <a className={`item ${this.state.mode === '7_col' ? 'active' : ''}`}
                      data-mode='7_col'
                      onClick={this.toggleMode}
                    >
                      col-7
                    </a>
                    <a className={`item ${this.state.mode === '4_col' ? 'active' : ''}`}
                      data-mode='4_col'
                      onClick={this.toggleMode}
                    >
                      col-4
                    </a>
                    <a className={`item ${this.state.mode === '3_col' ? 'active' : ''}`}
                      data-mode='3_col'
                      onClick={this.toggleMode}
                    >
                      col-3
                    </a>
                    <a className={`item ${this.state.mode === '2_col' ? 'active' : ''}`}
                      data-mode='2_col'
                      onClick={this.toggleMode}
                    >
                      col-2
                    </a>
                  </div>
                </div>
                <StoryCard
                  mode={this.state.mode}
                  dataJSON={this.state.dataJSON}
                  houseColors={this.props.houseColors}
                  domain={this.props.domain}
                  schemaJSON={this.state.schemaJSON}
                  optionalConfigJSON={this.state.optionalConfigJSON}
                  optionalConfigSchemaJSON={this.state.optionalConfigSchemaJSON}
                  linkDetails={this.state.refLinkDetails}
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}