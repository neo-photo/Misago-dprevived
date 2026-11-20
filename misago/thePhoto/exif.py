from PIL import ExifTags
import PIL.ImageCms

import datetime
import io

exifToStore =[
  "ExposureProgram",
  "Make",
  "Model",
  "Orientation",
  "Artist",
  "ExposureBiasValue",
  "Flash",
  "FocalLength",
  "FocalLengthIn35mmFilm",
  "ExifImageWidth",
  "ExifImageHeight",
  "SensingMethod",
  "ExposureTime",
  "FNumber",
  "ISOSpeedRatings",
  "ExposureMode" ,
  "SensitivityType",
  "WhiteBalance",
  "LensSpecification" ,
  "LensMake",
  "LensModel",
  "GainControl",
  "SubjectDistanceRange",
  "CompositeImage",
  "ColorSpace"
]

exifDate=[
  "DateTime",
  "OffsetTime"
  "DateTimeOriginal",
  "OffsetTimeOriginal",
  "DateTimeDigitized",
  "OffsetTimeDigitized",
]

gps ={
  "GPSLatitudeRef":1,
  "GPSLatitude":2,
  "GPSLongitudeRef":3,
  "GPSLongitude":4,
  "GPSAltitude":6,
  "GPSTimeStamp":7,
  "GPSDateStamp":29
   }

def makeDate(d, o):
  if o:
    format_string_tz = "%Y:%m:%d %H:%M:%S%z"
    parsed_datetime = datetime.datetime.strptime(d + o, format_string_tz)
    return  parsed_datetime.astimezone(datetime.UTC).strftime("%Y:%m:%d %H:%M:%S")
  else:
    return d

def makeIcc(icc, exif):
  profile = PIL.ImageCms.ImageCmsProfile(io.BytesIO(icc))
  exif["IccProfile"] = PIL.ImageCms.getProfileName(profile).strip()
  exif["IccVersion"] = profile.profile.version
  return exif

def makeExif(pilImage):
    exifResult = {}
    if len(pilImage.info.get('exif',''))>0:
      try:
        exifData = pilImage._getexif()
      except SyntaxError:
        exifData = None
      if exifData and len(exifData)>0 :
        exifDict = {
                ExifTags.TAGS.get(tag_id, tag_id): value
                for tag_id, value in exifData.items()
            }

        for one in exifToStore:
            v = exifDict.get(one)
            if v:
              exifResult[one] = str(v).replace("\x00","").strip()

        #GPS
        if "GPSInfo" in exifDict:
            gpsData =  exifDict["GPSInfo"]

            v = gpsData.get(gps.get("GPSAltitude"))
            if v:
              exifResult["GPSAltitude"] = str(v).strip()

            if gps.get("GPSLatitude") in gpsData:
              (deg,min,sec) = gpsData.get(gps.get("GPSLatitude"))
              lat = float(deg) + (float(min)/60.0) + (float(sec)/60.0)
              if (gpsData.get(gps.get("GPSLatitudeRef")))=="S": lat = -lat

              (deg,min,sec) =gpsData.get(gps.get("GPSLongitude"))
              lon =  float(deg) + (float(min)/60.0) + (float(sec)/60.0)
              if (gpsData.get(gps.get("GPSLongitudeRef")))=="W": lon = -lon
              exifResult["GPSPosition"] = "%f, %f" %(lat, lon)
            gpsDate = gpsData.get(gps.get("GPSDateStamp"))
            gpsTime = gpsData.get(gps.get("GPSTimeStamp"))
            if gpsDate:
              exifResult["GPSDatetime"] = str(gpsDate).strip()
              if gpsTime:
                exifResult["GPSDatetime"] += " %s:%s:%s"%(int(gpsTime[0]),int(gpsTime[1]),str(gpsTime[2]).strip())
        #Dates
        dt = exifDict.get("DateTime")
        dto = exifDict.get("OffsetTime")
        dtd = exifDict.get("DateTimeOriginal")
        dtdo = exifDict.get("OffsetTimeOriginal")
        dtc = exifDict.get("DateTimeDigitized")
        dtco = exifDict.get("OffsetTimeDigitized")
        if dtc:
           exifResult["DateTimeDigitized"] = makeDate(dtc,dtco)
        if dtd:
          exifResult["DateTimeOriginal"] = makeDate(dtd,dtdo)
        if dt:
          exifResult["DateTime"] = makeDate(dt,dto)

    return exifResult

