import React from 'react';
import { all as axiosAll, get as axiosGet, spread as axiosSpread } from 'axios';
import StoryCard from './Container.jsx';
import JSONSchemaForm from '../../lib/js/react-jsonschema-form';

export default class EditStoryCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 1,
      dataJSON: {},
      mode: "col16",
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
    let data = this.state.dataJSON;
    let getDataObj = {
      step: this.state.step,
      dataJSON: data,
      schemaJSON: this.state.schemaJSON,
      uiSchemaJSON: this.state.uiSchemaJSON,
      optionalConfigJSON: this.state.optionalConfigJSON,
      optionalConfigSchemaJSON: this.state.optionalConfigSchemaJSON
    }
    getDataObj["name"] = getDataObj.dataJSON.data.headline.substr(0,225); // Reduces the name to ensure the slug does not get too long
    return getDataObj;
  }

  componentDidMount() {
    if (typeof this.props.dataURL === "string"){
      axiosAll([
        axiosGet(this.props.dataURL),
        axiosGet(this.props.schemaURL),
        axiosGet(this.props.optionalConfigURL),
        axiosGet(this.props.optionalConfigSchemaURL),
        axiosGet(this.refLinkSourcesURL),
        axiosGet(this.props.uiSchemaURL),
        axiosGet(this.props.siteConfigURL)
      ]).then(axiosSpread((card, schema, opt_config, opt_config_schema, linkSources, uiSchema, site_configs) => {
          let formData = card.data,
              fav = undefined,
              str = formData.data.url,
              arr = str && str.split("/"),
              name = undefined,
              dom = arr && (arr[2]),
              stateVar;

          linkSources.data.forEach((link)=>{
            let arr2 = link.url && link.url.split("/"),
               linkc = arr2 && (arr2[2]);

            if(linkc === dom){
              fav = link.favicon_url;
              name = link.name;
            }
          });
          formData.data.faviconurl = fav;
          formData.data.domainurl = dom;
          formData.data.publishername = name;
          formData.data.publishedat = new Date().toISOString();
          if(window.intersection_names && window.intersection_names.length){
            schema.data.properties.data.properties.genre.enum = window.intersection_names;
            let enumNames = JSON.parse(JSON.stringify(window.intersection_names));
            enumNames[0] = 'Blank';
            schema.data.properties.data.properties.genre.enumNames = enumNames;
          }
          if(window.subintersection_names && window.subintersection_names.length){
            schema.data.properties.data.properties.subgenre.enum = window.subintersection_names;
            let enumNames = JSON.parse(JSON.stringify(window.subintersection_names));
            enumNames[0] = 'Blank';
            schema.data.properties.data.properties.subgenre.enumNames = enumNames;
          }
          stateVar = {
            dataJSON: formData,
            schemaJSON: schema.data,
            uiSchemaJSON: uiSchema.data,
            optionalConfigJSON: opt_config.data,
            optionalConfigSchemaJSON: opt_config_schema.data,
            refLinkDetails: linkSources.data,
            siteConfigs: site_configs.data
          }

          stateVar.optionalConfigJSON.house_colour = stateVar.siteConfigs.house_colour;
          stateVar.optionalConfigJSON.reverse_house_colour = stateVar.siteConfigs.reverse_house_colour;
          stateVar.optionalConfigJSON.font_colour = stateVar.siteConfigs.font_colour;
          stateVar.optionalConfigJSON.reverse_font_colour = stateVar.siteConfigs.reverse_font_colour;
          stateVar.optionalConfigJSON.story_card_flip = stateVar.siteConfigs.story_card_flip;
          stateVar.dataJSON.data.language = stateVar.siteConfigs.primary_language.toLowerCase();
          this.setState(stateVar);
        }))
        .catch((error) => {
          console.error(error);
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
          let fav = undefined;
          let str = formData.data.url;
          let arr = str && str.split("/");
          let name = undefined;
          let dom = arr && (arr[2]);
          this.state.refLinkDetails.forEach((link)=>{
            let arr2 = link.url && link.url.split("/");
            let linkc = arr2 && (arr2[2]);
            if(linkc === dom){
              fav = link.favicon_url;
              name = link.name;
            }
          });
          formData.data.faviconurl = fav;
          formData.data.domainurl = dom;
          formData.data.publishername = name;
          formData.data.interactive = (formData.data.hasimage || formData.data.hasvideo || formData.data.hasdata) ? true : false
          dataJSON = formData;
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

  renderSEO() {
    let data = this.state.dataJSON.data,
      seo_blockquote;
    seo_blockquote = `<blockquote><a href=${data.url} rel="nofollow">${data.headline ? `<h2>${data.headline}</h2>` : ""}</a>${data.byline ? `<p>${data.byline}</p>` : ""}${data.publishedat ? `<p>${data.publishedat}</p>` : ""}${data.series ? `<p>${data.series}</p>` : ""}${data.genre ? `<p>${data.genre}</p>` : ""}${data.subgenre ? `<p>${data.subgenre}</p>` : ""}${data.summary ? `<p>${data.summary}</p>` : ""}</blockquote>`;
    return seo_blockquote;
  }


  renderSchemaJSON() {
    switch(this.state.step){
      case 1:
        return this.state.schemaJSON;
    }
  }

  renderFormData() {
    switch(this.state.step) {
      case 1:
        return this.state.dataJSON;
    }
  }

  showLinkText() {
    switch(this.state.step) {
      case 1:
        return '';
    }
  }

  showButtonText() {
    switch(this.state.step) {
      case 1:
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
      return {
        mode: "blank"
      }
    }, (() => {
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
        }))
  }

  render() {
    if (this.state.schemaJSON === undefined) {
      return(<div>Loading</div>)
    } else {
      return (
        <div className="proto-container">
          <div className="ui grid form-layout">
            <div className="row">
              <div className="four wide column proto-card-form protograph-scroll-form">
                <div>
                  <div className="section-title-text">Fill the form</div>
                  <div className="ui label proto-pull-right">
                    toStory
                  </div>
                </div>
                <JSONSchemaForm
                  uiSchema={this.state.uiSchemaJSON}
                  schema={this.renderSchemaJSON()}
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
                    <a className={`item ${this.state.mode === 'col16' ? 'active' : ''}`}
                      data-mode='col16'
                      onClick={this.toggleMode}
                    >
                      16c-cover
                    </a>
                    <a className={`item ${this.state.mode === 'col7' ? 'active' : ''}`}
                      data-mode='col7'
                      onClick={this.toggleMode}
                    >
                      7c
                    </a>
                    <a className={`item ${this.state.mode === 'col4' ? 'active' : ''}`}
                      data-mode='col4'
                      onClick={this.toggleMode}
                    >
                      4c
                    </a>
                    <a className={`item ${this.state.mode === 'col3' ? 'active' : ''}`}
                      data-mode='col3'
                      onClick={this.toggleMode}
                    >
                      3c
                    </a>
                    <a className={`item ${this.state.mode === 'col2' ? 'active' : ''}`}
                      data-mode='col2'
                      onClick={this.toggleMode}
                    >
                      2c
                    </a>
                  </div>
                </div>
                {
                  this.state.mode == "blank" ? <div /> : <div className="protograph-app-holder">
                    <StoryCard
                      mode={this.state.mode}
                      dataJSON={this.state.dataJSON}
                      domain={this.props.domain}
                      optionalConfigJSON={this.state.optionalConfigJSON}
                      linkDetails={this.state.refLinkDetails}
                    />
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}