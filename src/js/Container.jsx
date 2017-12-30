import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import ta from 'time-ago';
export default class toStoryCard extends React.Component {
  constructor(props) {
    super(props)
    let stateVar = {
      fetchingData: true,
      dataJSON: {
        card_data: {},
        configs: {}
      },
      schemaJSON: undefined,
      linkDetails: undefined,
      domain: undefined,
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
    if(this.props.linkDetails){
      stateVar.linkDetails = this.props.linkDetails;
    }
    if(this.props.domain){
      stateVar.domain = this.props.domain;
    }
    if(this.props.houseColors){
      stateVar.optionalConfigJSON.house_color = this.props.houseColors.house_color;
      stateVar.optionalConfigJSON.inverse_house_color = this.props.houseColors.inverse_house_color;
      stateVar.optionalConfigJSON.house_font_color = this.props.houseColors.house_font_color;
      stateVar.optionalConfigJSON.inverse_house_font_color = this.props.houseColors.inverse_house_font_color;
    }
    this.state = stateVar;
  }

  componentDidMount() {
    if (this.state.fetchingData){
      axios.all([axios.get(this.props.dataURL), axios.get(this.props.schemaURL), axios.get(this.props.optionalConfigURL), axios.get(this.props.optionalConfigSchemaURL), axios.get(window.ref_link_sources_url)])
        .then(axios.spread((card, schema, opt_config, opt_config_schema, links) => {
          this.setState({
            fetchingData: false,
            dataJSON: {
              card_data: card.data,
              configs: opt_config.data
            },
            linkDetails:links.data,
            schemaJSON: schema.data,
            optionalConfigJSON: opt_config.data,
            optionalConfigSchemaJSON: opt_config_schema.data
          });
        }));
    }
  }


  exportData() {
    return this.props.selector.getBoundingClientRect();
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

  handleClick(){
    window.open(this.state.dataJSON.card_data.data.url,'_blank');
  }

  renderSixteenCol(){
    if(!this.state.schemaJSON){
      return(
        <div>Loading</div>
      )
    }else{
      let genreColor = "rgba(51, 51, 51, 0.75)",
      genreFontColor = "#fff";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_color;
        genreFontColor = this.state.optionalConfigJSON.house_font_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.state.optionalConfigJSON.inverse_house_color;
        genreFontColor = this.state.optionalConfigJSON.inverse_house_font_color;
      }
      let fav = undefined;
      let str = this.state.dataJSON.card_data.data.url;
      var arr = str.split("/");
      let dom = arr[0] + "//" + arr[2];
      console.log(this.state.domain === dom);
      if(this.state.domain != dom){
        this.state.linkDetails.forEach((link)=>{
          if(link.url === dom){
            fav = link.favicon_url;
          }
        });
      }
      return(
        <div className="proto-col col-16" onClick={()=>{ this.handleClick() }}>
          <div className="col-16-story-card">
          {this.state.dataJSON.card_data.data.imageurl ? <img style={{position:'absolute', left:0, top:0, height:430, width: 1260}} src={this.state.dataJSON.card_data.data.imageurl}></img>: null}
            <div className="bottom-pull-div">
              <div className="card-tags">
                {fav ? 
                <div className="publisher-icon">
                  <img className="favicon" src = {fav}/>
                </div> : null}
                {this.state.dataJSON.card_data.data.genre ? <div className="series-name">GenderAnd<div className="gener" style={{backgroundColor: genreColor, color: genreFontColor}}>
                  {this.state.dataJSON.card_data.data.genre } </div></div> : null}
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-gener-light">Sponsored</div> : null
                }
              </div>
              <div className="article-title">
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line">
                {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
              </div>
            </div>
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
      let genreColor = "rgba(51, 51, 51, 0.75)",
          genreFontColor = "#fff";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_color;
        genreFontColor = this.state.optionalConfigJSON.house_font_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.state.optionalConfigJSON.inverse_house_color;
        genreFontColor = this.state.optionalConfigJSON.inverse_house_font_color;
      }
      let fav = undefined;
      let str = this.state.dataJSON.card_data.data.url;
      var arr = str.split("/");
      let dom = arr[0] + "//" + arr[2]+'/';
      if(this.state.domain != dom){
        this.state.linkDetails.forEach((link)=>{
          if(link.url === dom){
            fav = link.favicon_url;
          }
        });
      }
      let light = this.state.dataJSON.card_data.data.imageurl;

      return(
        <div className="proto-col col-7" onClick={()=>{ this.handleClick() }}>
          {this.state.dataJSON.card_data.data.imageurl ? <img style={{position:'absolute', left:0, top:0, height:250, width:540 }} src={this.state.dataJSON.card_data.data.imageurl}></img>: <div style={{backgroundColor:'#fafafa',position:'absolute',left:0, top:0, height:250, width:540}}></div>}
          <div className="col-7-story-card">
            <div className="card-tags">
            {fav ? 
                <div className="publisher-icon">
                  <img className="favicon" src = {fav}/>
                </div> : null}
                {this.state.dataJSON.card_data.data.genre ? <div className="series-name">GenderAnd<div className="gener" style={{backgroundColor: genreColor,  color: genreFontColor}}>
                  {this.state.dataJSON.card_data.data.genre } </div></div> : null}
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-gener-dark" style={{color: light ?'white' :'black' }}>Sponsored</div> : null
                }
            </div>
            <div className="bottom-pull-div">
              <div className="article-title" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
              </div>
            </div>
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
      let genreColor = "rgba(51, 51, 51, 0.75)",
          genreFontColor = "#fff";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_color;
        genreFontColor = this.state.optionalConfigJSON.house_font_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.state.optionalConfigJSON.inverse_house_color;
        genreFontColor = this.state.optionalConfigJSON.inverse_house_font_color;
      }
      let fav = undefined;
      let str = this.state.dataJSON.card_data.data.url;
      var arr = str.split("/");
      let dom = arr[0] + "//" + arr[2]+'/';
      if(this.state.domain != dom){
        this.state.linkDetails.forEach((link)=>{
          if(link.url === dom){
            fav = link.favicon_url;
          }
        });
      }
      let light = this.state.dataJSON.card_data.data.imageurl;

      return(
        <div className="proto-col col-4" onClick={()=>{ this.handleClick() }}>
          {this.state.dataJSON.card_data.data.imageurl ? <img style={{position:'absolute', left:0, top:0, height:250, width:300 }} src={this.state.dataJSON.card_data.data.imageurl}></img>: <div style={{backgroundColor:'#fafafa',position:'absolute',left:0, top:0, height:250, width:300}}></div>}
          <div className="col-4-story-card">
            <div className="card-tags">
            {fav ? 
                <div className="publisher-icon">
                  <img className="favicon" src = {fav}/>
                </div> : null}
                {this.state.dataJSON.card_data.data.genre ? <div className="series-name">GenderAnd<div className="gener" style={{backgroundColor: genreColor, color: genreFontColor}}>
                  {this.state.dataJSON.card_data.data.genre } </div></div> : null}
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-gener-dark" style={{color: light ?'white' :'black' }}>Sponsored</div> : null
                }
            </div>
            <div className="bottom-pull-div">
              <div className="article-title" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
              </div>
            </div>
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
      let genreColor = "rgba(51, 51, 51, 0.75)",
      genreFontColor = "#fff";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_color;
        genreFontColor = this.state.optionalConfigJSON.house_font_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.state.optionalConfigJSON.inverse_house_color;
        genreFontColor = this.state.optionalConfigJSON.inverse_house_font_color;
      }
      let fav = undefined;
      let str = this.state.dataJSON.card_data.data.url;
      var arr = str.split("/");
      let dom = arr[0] + "//" + arr[2]+'/';
      if(this.state.domain != dom){
        this.state.linkDetails.forEach((link)=>{
          if(link.url === dom){
            fav = link.favicon_url;
          }
        });
      }
      let light = this.state.dataJSON.card_data.data.imageurl;

      return(
        <div className="proto-col col-3" onClick={()=>{ this.handleClick() }}>
          {this.state.dataJSON.card_data.data.imageurl ? <img style={{position:'absolute', left:0, top:0, height:250, width:220 }} src={this.state.dataJSON.card_data.data.imageurl}></img>: <div style={{backgroundColor:'#fafafa',position:'absolute',left:0, top:0, height:250, width:220}}></div>}
          <div className="col-3-story-card" >
            <div className="card-tags">
            {fav ? 
                <div className="publisher-icon">
                  <img className="favicon" src = {fav}/>
                </div> : null}
                {this.state.dataJSON.card_data.data.genre ? <div className="series-name">GenderAnd<div className="gener" style={{backgroundColor: genreColor,  color: genreFontColor}}>
                  {this.state.dataJSON.card_data.data.genre } </div></div> : null}
                {
                  this.state.dataJSON.card_data.data.sponsored ? <div className="sub-gener-dark" style={{color: light ?'white' :'black' }}>Sponsored</div> : null
                }
            </div>
            <div className="bottom-pull-div">
              <div className="article-title" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
              </div>
            </div>
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
      let genreColor = "rgba(51, 51, 51, 0.75)",
      genreFontColor = "#fff";
      if(this.state.dataJSON.card_data.data.interactive){
        genreColor = this.state.optionalConfigJSON.house_color;
        genreFontColor = this.state.optionalConfigJSON.house_font_color;
      }
      if(this.state.dataJSON.card_data.data.sponsored){
        genreColor = this.state.optionalConfigJSON.inverse_house_color;
        genreFontColor = this.state.optionalConfigJSON.inverse_house_font_color;
      }
      let fav = undefined;
      let str = this.state.dataJSON.card_data.data.url;
      var arr = str.split("/");
      let dom = arr[0] + "//" + arr[2]+'/';
      if(this.state.domain != dom){
        this.state.linkDetails.forEach((link)=>{
          if(link.url === dom){
            fav = link.favicon_url;
          }
        });
      }
      let light = this.state.dataJSON.card_data.data.imageurl;

      return(
        <div className="proto-col col-2" onClick={()=>{ this.handleClick() }}>
          {this.state.dataJSON.card_data.data.imageurl ? <img style={{position:'absolute', left:0, top:0, height:250, width:140 }} src={this.state.dataJSON.card_data.data.imageurl}></img>: <div style={{backgroundColor:'#fafafa',position:'absolute',left:0, top:0, height:250, width:140}}></div>}
          <div className="col-2-story-card">
            <div className="card-tags">
                {this.state.dataJSON.card_data.data.genre ? <div className="series-name"><div className="gener" style={{backgroundColor: genreColor, color: genreFontColor}}>
                  {this.state.dataJSON.card_data.data.genre } </div></div> : null}
            </div>
            <div className="bottom-pull-div">
              <div className="article-title" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.headline}
              </div>
              <div className="by-line" style={{color: light ?'white' :'black' }}>
                {this.state.dataJSON.card_data.data.byline + ' . ' + ta.ago(this.state.dataJSON.card_data.data.publishedat)}
              </div>
            </div>
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