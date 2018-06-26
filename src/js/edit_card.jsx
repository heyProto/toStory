import React from 'react';
import { all as axiosAll, get as axiosGet, spread as axiosSpread } from 'axios';
import Card from './card.jsx';
import JSONSchemaForm from '../../lib/js/react-jsonschema-form';

export default class EditStoryCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataJSON: {},
      loading: true,
      publishing: false,
      uiSchemaJSON: {},
      schemaJSON: undefined,
      refLinkDetails: undefined
    }
    this.refLinkSourcesURL = window.ref_link_sources_url;
    // this.toggleMode = this.toggleMode.bind(this);
  }

  exportData() {
    let data = this.state.dataJSON;
    let getDataObj = {
      dataJSON: data,
      schemaJSON: this.state.schemaJSON,
      uiSchemaJSON: this.state.uiSchemaJSON,
      optionalConfigJSON: {},
      optionalConfigSchemaJSON: {}
    }
    getDataObj["name"] = getDataObj.dataJSON.data.headline.substr(0,225); // Reduces the name to ensure the slug does not get too long
    return getDataObj;
  }

  componentDidMount() {
    if (typeof this.props.dataURL === "string"){
      axiosAll([
        axiosGet(this.props.dataURL),
        axiosGet(this.props.schemaURL),
        axiosGet(this.refLinkSourcesURL),
        axiosGet(this.props.uiSchemaURL),
        axiosGet(this.props.siteConfigURL)
      ]).then(axiosSpread((card, schema, linkSources, uiSchema, site_configs) => {
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
            refLinkDetails: linkSources.data,
            siteConfigs: site_configs.data
          }

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
  }

  onSubmitHandler({formData}) {
    if (typeof this.props.onPublishCallback === "function") {
      this.setState({ publishing: true });
      let publishCallback = this.props.onPublishCallback();
      publishCallback.then((message) => {
        this.setState({ publishing: false });
      });
    }
  }

  renderSEO() {
    let data = this.state.dataJSON.data,
      seo_blockquote;
    seo_blockquote = `<blockquote><a href=${data.url} rel="nofollow">${data.headline ? `<h2>${data.headline}</h2>` : ""}</a>${data.byline ? `<p>${data.byline}</p>` : ""}${data.publishedat ? `<p>${data.publishedat}</p>` : ""}${data.series ? `<p>${data.series}</p>` : ""}${data.genre ? `<p>${data.genre}</p>` : ""}${data.subgenre ? `<p>${data.subgenre}</p>` : ""}${data.summary ? `<p>${data.summary}</p>` : ""}</blockquote>`;
    return seo_blockquote;
  }


  renderSchemaJSON() {
    return this.state.schemaJSON;
  }

  renderFormData() {
    return this.state.dataJSON;
  }

  showButtonText() {
    return 'Publish';
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
                  <button type="submit" className={`${this.state.publishing ? 'ui primary loading disabled button' : ''} default-button protograph-primary-button`}>{this.showButtonText()}</button>
                </JSONSchemaForm>
              </div>
              <div className="twelve wide column proto-card-preview proto-share-card-div">
                <div className="protograph-app-holder">
                  <Card
                    dataJSON={this.state.dataJSON}
                    domain={this.props.domain}
                    linkDetails={this.state.refLinkDetails}
                    site_configs={this.state.siteConfigs}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}