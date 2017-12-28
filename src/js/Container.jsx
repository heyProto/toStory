import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import ta from 'time-ago';
export default class ToArticleCard extends React.Component {
  constructor(props) {
    super(props)
    let stateVar = {
      fetchingData: true,
      dataJSON: {
        card_data: {},
        configs: {}
      },
      schemaJSON: undefined,
      optionalConfigJSON: {},
      optionalConfigSchemaJSON: undefined
    };
    if (this.props.dataJSON) {
      stateVar.fetchingData = false;
      stateVar.dataJSON = this.props.dataJSON;
    }

    if (this.props.schemaJSON) {
      stateVar.schemaJSON = this.props.schemaJSON;
    }

    if (this.props.optionalConfigJSON) {
      stateVar.optionalConfigJSON = this.props.optionalConfigJSON;
    }

    if (this.props.optionalConfigSchemaJSON) {
      stateVar.optionalConfigSchemaJSON = this.props.optionalConfigSchemaJSON;
    }
    if(this.props.houseColors){
      stateVar.optionalConfigJSON.house_color = this.props.houseColors.house_color;
      stateVar.optionalConfigJSON.inverse_house_color = this.props.houseColors.inverse_house_color;
    }
    this.state = stateVar;
  }

  componentDidMount() {
    if (this.state.fetchingData){
      axios.all([axios.get(this.props.dataURL), axios.get(this.props.schemaURL), axios.get(this.props.optionalConfigURL), axios.get(this.props.optionalConfigSchemaURL)])
        .then(axios.spread((card, schema, opt_config, opt_config_schema) => {
          this.setState({
            fetchingData: false,
            dataJSON: {
              card_data: card.data,
              configs: opt_config.data
            },
            schemaJSON: schema.data,
            optionalConfigJSON: opt_config.data,
            optionalConfigSchemaJSON: opt_config_schema.data
          });
        }));
    }
  }


  exportData() {
    return document.querySelector('#protograph-div').getBoundingClientRect();
  }

  calculateDateTime() {
    const data = this.state.dataJSON.card_data;
    let date_split, date_split_by_hyphen, new_date, month, time;
      date_split = data.data.date.split("T")[0],
      date_split_by_hyphen = date_split.split("-"),
      new_date = new Date(date_split),
      month = new_date.toLocaleString("en-us", { month: "short" }),
      time = data.data.date.split("T")[1];
    let is_am_pm_split = time.split(":"), am_pm;
    if (is_am_pm_split[0] < "12"){
      am_pm = "am"
    } else {
      am_pm = "pm"
    }

    return {
      month: month,
      am_pm: am_pm,
      date: date_split_by_hyphen,
      time: time
    }
  }

  renderSixteenCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)";
      console.log(this.state);
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.props.optionalConfigJSON.house_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.props.optionalConfigJSON.inverse_house_color;
      }
      console.log(genreColor);
      return(
        <div className="proto-story-container">
          {this.state.dataJSON.card_data.data.imageurl ? <img height={430} src={this.state.dataJSON.card_data.data.imageurl}></img>: null}
          <div className="proto-story-genre-cont">
            {this.state.dataJSON.card_data.data.genre ? <span className="proto-story-genre" style={{backgroundColor: genreColor}}>
              {this.state.dataJSON.card_data.data.genre } </span> : null}
            {
              this.state.dataJSON.card_data.data.sponsored ? <span className="proto-story-sponsored">SPONSORED</span> : null
            }
          </div>
          <div className="proto-story-headline">
            {this.state.dataJSON.card_data.data.headline}
          </div>
          <div className="proto-story-date">
            {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
          </div>
        </div>
      )
    }
  }
  renderSevenCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.props.optionalConfigJSON.house_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.props.optionalConfigJSON.inverse_house_color;
      }
      return(
        <div className="proto-story-container-seven proto-story-container">
          {this.state.dataJSON.card_data.data.imageurl ? <img height={250} src={this.state.dataJSON.card_data.data.imageurl}></img>: null}
          <div className="proto-story-genre-cont proto-story-genre-seven">
            {this.state.dataJSON.card_data.data.genre ? <span className="proto-story-genre" style={{backgroundColor: genreColor}}>
              {this.state.dataJSON.card_data.data.genre } </span> : null}
            {
              this.state.dataJSON.card_data.data.sponsored ? <span className="proto-story-sponsored">SPONSORED</span> : null
            }
          </div>
          <div className="proto-story-headline-seven proto-story-headline">
            {this.state.dataJSON.card_data.data.headline}
          </div>
          <div className="proto-story-date-seven proto-story-date">
            {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
          </div>
        </div>
      )
    }
  }
  renderFourCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.props.optionalConfigJSON.house_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.props.optionalConfigJSON.inverse_house_color;
      }
      return(
        <div className="proto-story-container-four proto-story-container">
          {this.state.dataJSON.card_data.data.imageurl ? <img height={250} src={this.state.dataJSON.card_data.data.imageurl}></img>: null}
          <div className="proto-story-genre-cont proto-story-genre-four">
            {this.state.dataJSON.card_data.data.genre ? <span className="proto-story-genre" style={{backgroundColor: genreColor}}>
              {this.state.dataJSON.card_data.data.genre } </span> : null}
            {
              this.state.dataJSON.card_data.data.sponsored ? <span className="proto-story-sponsored">SPONSORED</span> : null
            }
          </div>
          <div className="proto-story-headline-four proto-story-headline">
            {this.state.dataJSON.card_data.data.headline}
          </div>
          <div className="proto-story-date-four proto-story-date">
            {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
          </div>
        </div>
      )
    }
  }
  renderThreeCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.props.optionalConfigJSON.house_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.props.optionalConfigJSON.inverse_house_color;
      }
      return(
        <div className="proto-story-container-three proto-story-container">
          {this.state.dataJSON.card_data.data.imageurl ? <img height={250} src={this.state.dataJSON.card_data.data.imageurl}></img>: null}
          <div className="proto-story-genre-cont proto-story-genre-three">
            {this.state.dataJSON.card_data.data.genre ? <span className="proto-story-genre" style={{backgroundColor: genreColor}}>
              {this.state.dataJSON.card_data.data.genre } </span> : null}
            {
              this.state.dataJSON.card_data.data.sponsored ? <span className="proto-story-sponsored">SPONSORED</span> : null
            }
          </div>
          <div className="proto-story-headline-three proto-story-headline">
            {this.state.dataJSON.card_data.data.headline}
          </div>
          <div className="proto-story-date-three proto-story-date">
            {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
          </div>
        </div>
      )
    }
  }
  renderTwoCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.props.optionalConfigJSON.house_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.props.optionalConfigJSON.inverse_house_color;
      }
      return(
        <div className="proto-story-container-two proto-story-container">
          {this.state.dataJSON.card_data.data.imageurl ? <img height={250} src={this.state.dataJSON.card_data.data.imageurl}></img>: null}
          <div className="proto-story-genre-cont proto-story-genre-two">
            {this.state.dataJSON.card_data.data.genre ? <span className="proto-story-genre" style={{backgroundColor: genreColor}}>
              {this.state.dataJSON.card_data.data.genre } </span> : null}
            {
              this.state.dataJSON.card_data.data.sponsored ? <span className="proto-story-sponsored">SPONSORED</span> : null
            }
          </div>
          <div className="proto-story-headline-two proto-story-headline">
            {this.state.dataJSON.card_data.data.headline}
          </div>
          <div className="proto-story-date-two proto-story-date">
            {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
          </div>
        </div>
      )
    }
  }
  render() {
    switch(this.props.mode) {
      case '16_col':
        return this.renderSixteenCol();
      case '7_col':
        return this.renderSevenCol();
      case '4_col':
        return this.renderFourCol();
      case '3_col':
        return this.renderThreeCol();
      case '2_col':
        return this.renderTwoCol();
    }
  }
}