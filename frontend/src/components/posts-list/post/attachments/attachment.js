import React from "react"
import misago from "misago"
import escapeHtml from "misago/utils/escape-html"
import formatFilesize from "misago/utils/file-size"

const DATE_ABBR = '<abbr title="%(absolute)s">%(relative)s</abbr>'
const USER_SPAN = '<span class="item-title">%(user)s</span>'
const USER_URL = '<a href="%(url)s" class="item-title">%(user)s</a>'

export default function (props) {
  return (
    <div className="col-xs-12 col-md-6">
      <AttachmentPreview {...props} />
      <div className="post-attachment">
        <a
          href={props.attachment.url.index}
          className="attachment-name item-title"
          target="_blank"
        >
          {props.attachment.filename}
        </a>
        <AttachmentDetails {...props} />
      </div>
      <AttachmentExifDetails {...props} />
  </div>
  )
}

export function AttachmentPreview(props) {
  if (props.attachment.is_image) {
    return (
      <div className="post-attachment-preview">
        <AttachmentThumbnail {...props} />
      </div>
    )
  } else {
    return (
      <div className="post-attachment-preview">
        <AttachmentIcon {...props} />
      </div>
    )
  }
}

export function AttachmentIcon(props) {
  return (
    <a href={props.attachment.url.index} className="material-icon">
      insert_drive_file
    </a>
  )
}

export function AttachmentThumbnail(props) {
  const url = props.attachment.url.thumb || props.attachment.url.index
  return (
    <a
      className="post-thumbnail"
      href={props.attachment.url.index}
      target="_blank"
      style={{ backgroundImage: 'url("' + escapeHtml(url) + '")' }}
    />
  )
}
export function AttachmentExifDetails(props) {
  if (props.attachment.plugin_data && props.attachment.plugin_data.exif && Object.keys(props.attachment.plugin_data.exif).length>0) {
       return (
       <div className="exifrow" data-url={props.attachment.url.thumb} >
         <button><span className="material-icon" >info_outline</span></button>
          <AttachmentExifRows exif={props.attachment.plugin_data.exif} />
          <AttachmentExifOverlay exif={props.attachment.plugin_data.exif} />
          </div>)
    }

  return null
}

export function AttachmentExifOverlay(exifh) {
                let exif = exifh.exif
                let iso =  "ISOSpeedRatings" in exif ? exif.ISOSpeedRatings : undefined
                let fmm = exif.FocalLength
                let brand = exif.Make
                let fmm35 = exif.FocalLengthIn35mmFilm
                let fnr = exif.FNumber
                let ex = exif.ExposureTime
                let model = exif.Model
                let line1 = "";
                let line2 = "";
                
                if (model!=undefined || brand!=undefined) {
                	if (model!=undefined && brand!=undefined) {
                	 	line1 = `Camera: ${model}/${brand} ` ;
                	}
                	else {
                		line1 = `Camera: ${model}${brand} ` ;
                	}
                
                }

                if (iso !=undefined ) {
                    line2 = `ISO${iso} ` ;
                }
                
                if (fmm != undefined){ 
                	line2 += `${fmm}mm `;
                    if (fmm35 != undefined && fmm35 != fmm && fmm35 != 0 ){ 
                	line2 += `(35mm eq. ${fmm35}mm) `;
                    }
                }
                if (ex != undefined){ 

  				    line2 += `${ex} `;
                }            
                
             if (fnr != undefined) {
                    //fnr =fnr.toFixed(1);
                    line2 += `𝑓/${fnr}`;
             	}   
             	
    		    if (line2 != '') line2 = (<span> {line2} </span>)
      return <div className="exifOverlay"><span>{line1} </span>{line2}</div>;
        }

export function AttachmentExifRows(exif) {
      const listItems2 = Object.keys(exif.exif).sort();
      let empty = {};
      //const listItems = listItems2.reduce((obj, key) => { obj[key] = exif.exif[key];  return obj;}, empty);
      //const listItems = Object.entries(exif.exif).map((e,nr) => <div key={nr}>{e[0]}: {e[1]}</div>);
      const listItems = listItems2.map((e,nr) => <div key={nr}>{e}: {exif.exif[e]}</div>);
      return <div className="exifdown">{listItems}</div>;
        }

export function AttachmentDetails(props) {
  let user = null
  if (props.attachment.url.uploader) {
    user = interpolate(
      USER_URL,
      {
        url: escapeHtml(props.attachment.url.uploader),
        user: escapeHtml(props.attachment.uploader_name),
      },
      true
    )
  } else {
    user = interpolate(
      USER_SPAN,
      {
        user: escapeHtml(props.attachment.uploader_name),
      },
      true
    )
  }

  const date = interpolate(
    DATE_ABBR,
    {
      absolute: escapeHtml(props.attachment.uploaded_on.format("LLL")),
      relative: escapeHtml(props.attachment.uploaded_on.fromNow()),
    },
    true
  )

  const message = interpolate(
    escapeHtml(
      pgettext(
        "post attachment",
        "%(filetype)s, %(size)s, uploaded by %(uploader)s %(uploaded_on)s."
      )
    ),
    {
      filetype: props.attachment.filetype,
      size: formatFilesize(props.attachment.size),
      uploader: user,
      uploaded_on: date,
    },
    true
  )

  return (
    <p
      className="post-attachment-description"
      dangerouslySetInnerHTML={{ __html: message }}
    />
  )
}
