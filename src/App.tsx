import {useEffect, useRef, useState} from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

import {readPsd} from 'ag-psd';
import {fabric} from 'fabric';
import {ColorResult, RGBColor, SketchPicker} from 'react-color'

const appContext : {[key: string]: any} = {}
let colorDict : {[key:string]: Array<number>} = {};
let activeColor = "255,255,255,255"

const SQRT255 = Math.sqrt(255 * 255 * 3)

function App() {
  const [count, setCount] = useState(0);
  const canvasEL = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color1, setColor1] = useState<ColorResult["rgb"]>({ r: 51, g: 100, b: 51 , a:1})
  const [colorGroup, setColorGroup] = useState<{[key:string]: ColorResult["rgb"]}>({})

  useEffect(() => {
    const options = {"width": 1280, "height": 720}
    const canvas = new fabric.Canvas(canvasEL.current, options)

    appContext.canvas = canvas;

    return () => {
      if (canvas) {
        canvas.dispose();
        delete appContext.canvas;
      }
      // colorDict = {}
    }
  })

  function psdAddToCanvas(ctx: any, psd: any) {
    // console.log(Object.prototype.toString.call(psd));
    if (psd?.children) {
      psd.children.map((c: any) => {
        if (!c.hidden) {
          if (c.canvas) {
            ctx.drawImage(c.canvas, c.left, c.top)
          } else if (c.children) {
            psdAddToCanvas(ctx, c);
          }
        }
      })
    }
  }

  function canvasAddToFabric(fabCanvas: any, canvas: any) {
    if (canvas?.children) {
      canvas.children.map((c: any) => {
        if (!c.hidden) {
          if (c.canvas) {
            // ctx.drawImage(c.canvas, c.left, c.top)
            fabCanvas.add(new fabric.Image(canvas));
          } else if (c.children) {
            canvasAddToFabric(fabCanvas, c);
          }
        }
      })
    }
  }


  const upload = (props: any) => {
    // console.log(props);
    const file = props.target.files[0];

    // console.log(file);

    if (window.FileReader) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const psd = readPsd(buffer);
        console.log(psd);

        const ctx = appContext.canvas.getContext();

        // psdAddToCanvas(ctx, psd)
        // canvasAddToFabric(appContext.canvas, psd)

        // appContext.canvas.add(psd.canvas)
        const canvas = appContext.canvas as fabric.Canvas;
        if (psd.canvas) {
          // canvas.add(new fabric.Canvas(psd.canvas))
        }

        // new fabric.
      }
    }
  }

  function isNearColor(thisColor: RGBColor, color: RGBColor) {
    const r1 = thisColor.r, g1 = thisColor.g, b1 = thisColor.b
    const r2 = color.r, g2 = color.g, b2 = color.b
    const d = Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2)
    const sim = 1 - d / SQRT255
    return sim > 0.85
  }

  const uploadPrinting = (props: any) => {
    colorDict = {}
    // console.log(props);
    const file = props.target.files[0];
    // console.log(file);

    const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;

    if (window.FileReader) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = (e) => {

        const url = reader.result as string;
        const ctx = canvasRef.current!.getContext("2d");
        ctx!.imageSmoothingEnabled = false

        let img = new Image();

        img.src = url;

        img.onload = function(){
          canvasRef.current!.width = img.width;
          canvasRef.current!.height = img.height;

          const posCount: number = img.width * img.height
          ctx!.drawImage(img,0,0);

          saveImageDate()

          // console.log(colorDict)

          const thisColorGroup : {[key:string]: ColorResult["rgb"]} = {}
          for (let i in colorDict) {
            if (colorDict[i].length >= posCount/1000 && i.split(",")[3] == "255") {
              const l = i.split(",")
              thisColorGroup[i] = {r: parseInt(l[0]), g: parseInt(l[1]), b: parseInt(l[2]), a: parseInt(l[3])}
            }
          }

          let tempCD : {[key:string]: any} = {}
          for (let i in colorDict) {
            if (colorDict[i].length < posCount/1000 || i.split(",")[3] != "255") {
              const l = i.split(",")
              // thisColorGroup[i] = {r: parseInt(l[0]), g: parseInt(l[1]), b: parseInt(l[2])}
              const r = parseInt(l[0]), g = parseInt(l[1]), b = parseInt(l[2]), a = parseInt(l[3])
              // let temp = "";
              let unMatch = true;
              for (let key in thisColorGroup) {
                let thisColor = thisColorGroup[key]
                // temp = key;
                if (isNearColor(thisColor, {r: r, g:g, b:b, a:a})) {
                  colorDict[key].push(...colorDict[i])
                  unMatch = false;
                  break;
                }

              }
              if (unMatch) {
                tempCD[i] = [colorDict[i], colorDict[i].length]
              }
            }
          }
          console.log(111, tempCD);
          setColorGroup(()=>{return thisColorGroup})

          activeColor = Object.keys(thisColorGroup)[0]

          setColor1(thisColorGroup[activeColor])
        }
      }
    }
  }

  const saveImageDate = () => {

    // colorDict = {}
    const canvas = canvasRef.current

    const width = canvas!.width,  height = canvas!.height
    const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width,height)
    const data = imageData.data;
    // const colorDict : {[key:string]: any} = {};
    for (let i = 0; i < width * height * 4; i += 4) {
      const colorString = data[i] + "," + data[i + 1] + "," + data[i + 2] + "," + data[i + 3];
      // if (data[i + 3] != 255 || colorString  == "0,0,0,0" || colorString == "255,0,0,1") {
      //   continue;
      // }
      if (colorString  == "0,0,0,0" ) {
        continue;
      }
      if (colorString in colorDict) {
        colorDict[colorString].push(i);
      } else {
        colorDict[colorString] = [i];
      }
    }
    // console.log("save",colorDict)
  }

  const colorChange = (color: ColorResult["rgb"], colorDictKey: string ) => {
    const canvas = canvasRef.current
    const width = canvas!.width,  height = canvas!.height
    // console.log(width, height)

    const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width,height)
    const data = imageData.data;

    // setColorGroup({...colorGroup, colorString: color})

    // console.log("colorchangeFun", colorDict)

    if (Object.keys(colorDict).length > 0) {
      // console.log(colorGroup[colorDictKey])
      let tempColorGroup = {...colorGroup}
      tempColorGroup[colorDictKey] = color
      setColorGroup(tempColorGroup)

      for (let i = 0; i < colorDict[colorDictKey].length; i++) {
        const posX = colorDict[colorDictKey][i]
        data[posX] = color.r;
        data[posX+1] = color.g;
        data[posX+2] = color.b;
        data[posX+3] = 255;
      }
    }
    // const colorDict : {[key:string]: any} = {};
    // for (let x=0; x<width*height*4; x+=4) {
    //   // console.log(x)
    //   const colorString = data[x] + "," + data[x+1] + "," + data[x+2] + "," + data[x+3];
    //   if (data[x] == 197 && data[x+1] == 119 && data[x+2] == 64) {
    //     data[x] = color.r;
    //     data[x+1] = color.g;
    //     data[x+2] = color.b;
    //   }
      // if (colorString in colorDict) {
      //   colorDict[colorString] += 1;
      // } else {
      //   colorDict[colorString] = 1;
      // }
    // }
    canvas!.getContext('2d')!.putImageData(imageData, 0, 0);
    //
    // for (let i in colorDict) {
    //   if (colorDict[i] > 100 && i.split(",")[3] == "255") {
    //     console.log(i + ":" + colorDict[i]);
    //   }
    // }

    // for (let x=0; x<width; x++) {
    //   for (let y=0; y<height; y++) {
    //     console.log(canvas!.getContext('2d')!.getImageData(x, y, 1,1))
    //   }
    // }
  }

  useEffect(()=> {
    // console.log('colorGroupEf', colorGroup)
  }, [colorGroup]);

  useEffect(()=> {
    colorChange(color1, activeColor)
  }, [color1]);


  const showColor = () => {

  }


  const selectColor = (color: ColorResult["rgb"], colorString: string) => {
    // colorGroup[colorString] = color
    // setColorGroup({...colorGroup, colorString: color})

    activeColor = colorString
    setColor1(color)
  }

  const save = () => {
    // const canvasObject = canvasContext.canvas.toJSON(['width', 'height'])
    // canvasTimes(canvasObject, 10)
    // // closeModal()
    // // console.log(JSON.stringify(canvasObject))
    // // console.log(canvasObject)
    //
    // canvasContext.canvas2.loadFromJSON(canvasObject, () => {
    //   canvasContext.canvas2.setWidth(canvasObject.width)
    //   canvasContext.canvas2.setHeight(canvasObject.height)
    //   // console.log(hasPattern, !hasPattern)
    //   if (hasPattern) {
    //     canvasContext.canvas2.setOverlayImage(null)
    //   }
    //   canvasContext.canvas2.renderAll()
    //
    //   const url = canvasContext.canvas2.toDataURL({
    //     format: "jpeg",
    //     quality: 1
    //   })
    //

    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png", 1.0)

      const a = document.createElement('a')
      a.href = url
      a.download = `untitled.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div className="App">
      <input type="file" onChange={upload}/>
      <input id="canvas" type="file" onChange={uploadPrinting}/>
      <ColorDiv colorGroup={colorGroup} selectColor={selectColor}/>
      <button onClick={showColor}>showColor</button>
      <button onClick={save}>Save</button>
      <SketchPicker color={color1} onChange={(color)=>{setColor1(color.rgb)}}/>
      <canvas id={"canvas"} ref={canvasRef} />
      <canvas id={"canvas2"} ref={canvasEL} />
    </div>
  )
}

const ColorDiv = (props: any) => {
  // console.log(props)
  // const a = [1,1,2]
  // console.log(props.colorGroup)
  //
  const colorStyle = {
      width: '36px',
      height: '14px',
      borderRadius: '2px'
  }

  const swatchStyle = {
      padding: '5px',
      background: '#fff',
      borderRadius: '1px',
      boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
      display: 'inline-block',
      cursor: 'pointer',
  }

  return <div>
    {Object.keys(props.colorGroup).map((value, index)=>{
        return <div key={index} style={{width: 46, height:24, margin:"10px", float:"left"}}>
          <div style={swatchStyle}><div style={{...colorStyle,
            background: `rgba(${props.colorGroup[value].r}, ${props.colorGroup[value].g},${props.colorGroup[value].b},${props.colorGroup[value].a})`}}
          onClick={()=>{props.selectColor(props.colorGroup[value], value)}}/>
          </div>
        </div>
  })}
  </div>;
}


export default App