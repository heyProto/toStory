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
    this.handleClick = this.handleClick.bind(this);
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

  handleClick(){
    let url = this.state.dataJSON.data.url
    window.open(url,'_top');
  }

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
        <div></div>
      )
    } else {
      let data = this.state.dataJSON.data;
      if(data.summary){
        if( data.summary.length > 90){
          data.summary = data.summary.slice(0,90) + '....'
        }
      }
      return (
        <div className="pro-card tostory-card" onClick={(this.state.dataJSON.data.url) ? this.handleClick : ''}>
          <div className="card-background" >
            {data.imageurl && <img src={data.imageurl} data-src={data.imageurl} alt={data.headline} />}
            <div className="background-overlay"></div>
          </div>
          
          <div className="context">
            <div className="intersection-tag">
              <span>{data.series}</span>
              {data.genre && <span>&#x2027;</span>}
              {data.genre && <span> {data.genre}</span>}
            </div>
            <h1>{data.headline}</h1>
            {data.summary && <p>{data.summary}</p>}
            <div class="publishing-info">
              {!data.hide_byline &&
                <div className="byline">
                  {data.byimageurl && 
                    <div className="byline-image">
                      <img className="proto-lazy-load-image" src={this.props.renderingSSR ? "https://cdn.protograph.pykih.com/lib/bg-image.jpg" : data.byimageurl} data-src={data.byimageurl} alt={data.byline} />
                    </div>
                  }
                  
                  {data.byline && <div className="byline-name">{data.byline}</div>}
                  
                </div>

              }
              <div className="timeline">{data.byline && <span>&#x2027;</span> }{data.publishedat && `${ta.ago(data.publishedat)}`}</div>
              <div class="media-icons">
								<span><img src="https://s3.ap-south-1.amazonaws.com/dev.cdn.protograph/lib/image.png" height="8px"/></span>
								<span class="dot-divider">&#x2027;</span>
								<span><img src="https://s3.ap-south-1.amazonaws.com/dev.cdn.protograph/lib/audio.png" height="8px"/></span>
								<span class="dot-divider">&#x2027;</span>
								<span><img src="https://s3.ap-south-1.amazonaws.com/dev.cdn.protograph/lib/video.png" height="8px"/></span>
							</div>
            </div>
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