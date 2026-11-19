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
  let exifData = null
  let result = ""
  if (props.attachment.plugin_data && props.attachment.plugin_data.exif) {
      exifData = props.attachment.plugin_data.exif
      
      //for (const [key, value] of Object.entries(exifData)) {result += key ": " + value + '\n';}
      Object.entries(exifData).map(function(keyName) {result += keyName[0] +": " + keyName[1] + '\n' })
       return (<div className="attaexif">
          <code className="exifInfo">{result}</code>
          </div>)
    }

  return null
  /*  return (<div className="attaexif">
          <button>exif</button>
          <div className="exifInfo">{{ result }}</div>
          </div>)*/

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
