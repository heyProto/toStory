import React from 'react';
import { all as axiosAll, get as axiosGet, spread as axiosSpread } from 'axios';
import ta from 'time-ago';
// import { parse as parseURL } from 'url';

export default class toStoryCard extends React.Component {
  constructor(props) {
    super(props)
    let stateVar = {
      fetchingData: true,
      dataJSON: {},
      domain: undefined
    };

    if (this.props.dataJSON) {
      stateVar.fetchingData = false;
      stateVar.dataJSON = this.props.dataJSON;
      stateVar.languageTexts = this.getLanguageTexts(this.props.dataJSON.data.language);
    }

    if(this.props.domain){
      stateVar.domain = this.props.domain;
    }

    if (this.props.siteConfigs) {
      stateVar.siteConfigs = this.props.siteConfigs;
    }

    this.state = stateVar;
  }

  componentDidMount() {
    if (this.state.fetchingData){
      let items_to_fetch = [
        axiosGet(this.props.dataURL)
      ];
      if (this.props.siteConfigURL) {
        items_to_fetch.push(axiosGet(this.props.siteConfigURL));
      }
      axiosAll(items_to_fetch).then(axiosSpread((card, site_configs) => {
        let stateVar = {
          fetchingData: false,
          dataJSON: card.data
        };
        site_configs ? stateVar["siteConfigs"] = site_configs.data : stateVar["siteConfigs"] =  this.state.siteConfigs;
        this.setState(stateVar);
      }));
    } else {
      if (!this.props.renderingSSR) {
        this.componentDidUpdate();
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.dataJSON) {
      this.setState({
        dataJSON: nextProps.dataJSON
      });
    }
  }

  componentDidUpdate() {
    if (this.props.mode === 'col2'){
      this.ellipsizeTextBox();
    }
    if (this.state.siteConfigs.story_card_flip && this.state.dataJSON.data.summary) {
      let elem = document.querySelector('.protograph-summary-text');
      this.multiLineTruncate(elem);
    }
  }

  multiLineTruncate(el) {
    let data = this.state.dataJSON.data,
      wordArray = data.summary.split(' '),
      props = this.props;
    if (el) {
      while(el.scrollHeight > el.offsetHeight) {
        wordArray.pop();
        el.innerHTML = wordArray.join(' ') + '...' + '<br><a id="read-more-button" href="#" className="protograph-read-more">Read more</a>' ;
      }
    }
  }

  exportData() {
    return this.props.selector.getBoundingClientRect();
  }

  // checkURL(url){
  //   var re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
  //   if (!re.test(url)) {
  //       return false;
  //   }
  //   return true;
  // }

  // calculateDateTime() {
  //   const data = this.state.dataJSON.data;
  //   let date_split, date_split_by_hyphen, new_date, month, time;
  //     date_split = data.data.date.split("T")[0],
  //     date_split_by_hyphen = date_split.split("-"),
  //     new_date = new Date(date_split),
  //     month = new_date.toLocaleString("en-us", { month: "short" }),
  //     time = data.data.date.split("T")[1];
  //   let is_am_pm_split = time.split(":"), am_pm;
  //   if (is_am_pm_split[0] < "12"){
  //     am_pm = "am"
  //   } else {
  //     am_pm = "pm"
  //   }

  //   return {
  //     month: month,
  //     am_pm: am_pm,
  //     date: date_split_by_hyphen,
  //     time: time
  //   }
  // }

  ellipsizeTextBox() {
    let container = this.props.selector.querySelector('.tostory-card-title h1'),
      text = this.props.selector.querySelector('.tostory-card-title h1'),
      // text = document.querySelector(`.protograph-${this.props.mode}-mode .protograph-tocluster-title`),
      wordArray;
    let headline = this.state.dataJSON.data.headline;
    if(headline === '' || headline === undefined){
      text.innerHTML='';
    }else{
      // Setting the string to work with edit mode.
      text.innerHTML = this.state.dataJSON.data.headline;
      wordArray = this.state.dataJSON.data.headline.split(' ');
      while (container.offsetHeight > 80) {
        wordArray.pop();
        text.innerHTML = wordArray.join(' ') + '...';
      }
    }
  }

  // handleClick(){
  //   window.open(this.state.dataJSON.data.url,'_top');
  // }

  // matchDomain(domain, url) {
  //   let url_domain = this.getDomainFromURL(url).replace(/^(https?:\/\/)?(www\.)?/, ''),
  //     domain_has_subdomain = this.subDomain(domain),
  //     url_has_subdomain = this.subDomain(url_domain);

  //   if (domain_has_subdomain) {
  //     return (domain === url_domain) || (domain.indexOf(url_domain) >= 0);
  //   }
  //   if (url_has_subdomain) {
  //     return (domain === url_domain) || (url_domain.indexOf(domain) >= 0);
  //   }
  //   return (domain === url_domain)
  // }

  // getDomainFromURL(url) {
  //   // let a = document.createElement('a');
  //   // a.href = url;
  //   let urlComponents = parseURL(url);
  //   return urlComponents.hostname;
  // }

  // subDomain(url) {
  //   if(!url){
  //     url = "";
  //   }
  //   // IF THERE, REMOVE WHITE SPACE FROM BOTH ENDS
  //   url = url.replace(new RegExp(/^\s+/), ""); // START
  //   url = url.replace(new RegExp(/\s+$/), ""); // END

  //   // IF FOUND, CONVERT BACK SLASHES TO FORWARD SLASHES
  //   url = url.replace(new RegExp(/\\/g), "/");

  //   // IF THERE, REMOVES 'http://', 'https://' or 'ftp://' FROM THE START
  //   url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i), "");

  //   // IF THERE, REMOVES 'www.' FROM THE START OF THE STRING
  //   url = url.replace(new RegExp(/^www\./i), "");

  //   // REMOVE COMPLETE STRING FROM FIRST FORWARD SLASH ON
  //   url = url.replace(new RegExp(/\/(.*)/), "");

  //   // REMOVES '.??.??' OR '.???.??' FROM END - e.g. '.CO.UK', '.COM.AU'
  //   if (url.match(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i))) {
  //     url = url.replace(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i), "");

  //     // REMOVES '.??' or '.???' or '.????' FROM END - e.g. '.US', '.COM', '.INFO'
  //   } else if (url.match(new RegExp(/\.[a-z]{2,4}$/i))) {
  //     url = url.replace(new RegExp(/\.[a-z]{2,4}$/i), "");
  //   }

  //   // CHECK TO SEE IF THERE IS A DOT '.' LEFT IN THE STRING
  //   var subDomain = (url.match(new RegExp(/\./g))) ? true : false;

  //   return (subDomain);
  // }

  render() {
    if (this.state.fetchingData) {
      return (
        <div>Loading</div>
      )
    } else {
      let data = this.state.dataJSON.data;
      console.log(data.publishedat)
      return (
        <div className="pro-card tostory-card">
          <div className="tostory-background full-background">
            <img src={data.imageurl}/>
            <div className="tostory-background-overlay"></div>
          </div>
          <div className="tostory-intersection-tag">
            <div className="tostory-intersection">
              {data.series}
              {data.genre && <div className="tostory-sub-intersection">{data.genre}</div>}
            </div>
            {data.subgenre && <div className="tostory-extra-tag">{data.subgenre}</div>}
          </div>
          <div className="tostory-context">
            <div className="tostory-title">
              <h1>{data.headline}</h1>
            </div>
            <div className="tostory-summary">
              <p>{data.summary}</p>
            </div>
            {data.hide_byline &&
              <div className="tostory-byline">
                <div className="tostory-byline-image"><img src={data.byimageurl}/></div>
                <div className="tostory-byline-name">{data.byline}</div>
              </div>
            }
            <div className="tostory-timeline">{data.publishedat && `${ta.ago(data.publishedat)}`}</div>
          </div>
        </div>
      );
    }
  }

  getLanguageTexts(languageConfig) {
    let language = languageConfig ? languageConfig : "hindi",
      text_obj;

    switch(language.toLowerCase()) {
      case "hindi":
        text_obj = {
          font: "'Sarala', sans-serif"
        }
        break;
      default:
        text_obj = {
          font: undefined
        }
        break;
    }
    return text_obj;
  }

}