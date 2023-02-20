import React, {useEffect, useRef, useState} from 'react'
import './App.css'

import {readPsd} from 'ag-psd';
// import {fabric} from 'fabric';
import {ColorResult, RGBColor, SketchPicker} from 'react-color'
import {Button, Layout, Upload} from "antd";
import {UndoOutlined} from "@ant-design/icons";

const {Header, Content, Sider} = Layout;

import convert from 'color-convert'

const appContext: { [key: string]: any } = {}
let colorDict: { [key: string]: Array<number> } = {};
let activeColor = "255,255,255,255"

let oImage : HTMLImageElement | null = null;
let tempImageData : Uint8ClampedArray | null = null;

let outputFilename : string = 'untitled';

const SQRT255 = Math.sqrt(255 * 255 * 3)

const Printing = () => {

  // let ac = convert.rgb.cmyk(255,0,0)
  // console.log(ac)
  // console.log(convert.cmyk.rgb(ac))
  const [count, setCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);

  const [color1, setColor1] = useState<ColorResult["rgb"]>({r: 51, g: 100, b: 51, a: 1})
  const [colorGroup, setColorGroup] = useState<{ [key: string]: ColorResult["rgb"] }>({})

  useEffect(() => {
    const options = {"width": 1280, "height": 720}
    // const canvas = new fabric.Canvas(canvasRef.current, options)
    const canvas = canvasRef.current
    appContext.canvas = canvasRef.current;

    return () => {
      if (canvas) {
        // canvas.dispose();
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

  // function canvasAddToFabric(fabCanvas: any, canvas: any) {
  //   if (canvas?.children) {
  //     canvas.children.map((c: any) => {
  //       if (!c.hidden) {
  //         if (c.canvas) {
  //           // ctx.drawImage(c.canvas, c.left, c.top)
  //           fabCanvas.add(new fabric.Image(canvas));
  //         } else if (c.children) {
  //           canvasAddToFabric(fabCanvas, c);
  //         }
  //       }
  //     })
  //   }
  // }

  // const upload = (props: any) => {
  //   // console.log(props);
  //   const file = props.target.files[0];
  //   // console.log(file);
  //
  //   if (window.FileReader) {
  //     const reader = new FileReader();
  //     reader.readAsArrayBuffer(file);
  //     reader.onloadend = (e) => {
  //       const buffer = e.target?.result as ArrayBuffer;
  //       const psd = readPsd(buffer);
  //       console.log(psd);
  //
  //       const ctx = appContext.canvas.getContext();
  //
  //       psdAddToCanvas(ctx, psd)
  //       canvasAddToFabric(appContext.canvas, psd)
  //
  //       appContext.canvas.add(psd.canvas)
  //       const canvas = appContext.canvas as fabric.Canvas;
  //       // if (psd.canvas) {
  //       //   canvas.add(new fabric.Canvas(psd.canvas))
  //       // }
  //     }
  //   }
  // }

  function isNearColor(thisColor: RGBColor, color: RGBColor) {
    const r1 = thisColor.r, g1 = thisColor.g, b1 = thisColor.b
    const r2 = color.r, g2 = color.g, b2 = color.b
    const d = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
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

        img.onload = function () {

          oImage = img;
          canvasRef.current!.width = img.width;
          canvasRef.current!.height = img.height;

          const posCount: number = img.width * img.height
          ctx!.drawImage(img, 0, 0);

          // saveImageDate()
          saveImageDate2()
          // saveImageDate3()

          // console.log(colorDict)

          const thisColorGroup: { [key: string]: ColorResult["rgb"] } = {}
          createColorGroup(thisColorGroup, posCount)
          // createColorGroup2(thisColorGroup, posCount)
          // createColorGroup3(thisColorGroup, posCount)

          setColorGroup(() => {
            return thisColorGroup
          })

          activeColor = Object.keys(thisColorGroup)[0]

          setColor1(thisColorGroup[activeColor])
        }
      }
    }
  }

  const uploadPrinting2 = (props: any) => {
    colorDict = {}
    // console.log(props);
    const file = props.file;
    // console.log(file);
    outputFilename = "自定义"+file.name

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

        img.onload = function () {
          oImage = img;
          canvasRef.current!.width = img.width;
          canvasRef.current!.height = img.height;

          const posCount: number = img.width * img.height
          ctx!.drawImage(img, 0, 0);

          // saveImageDate()
          saveImageDate2()
          // saveImageDate3()

          // console.log(colorDict)

          const thisColorGroup: { [key: string]: ColorResult["rgb"] } = {}
          // createColorGroup(thisColorGroup, posCount)
          createColorGroup2(thisColorGroup, posCount)
          // createColorGroup3(thisColorGroup, posCount)

          setColorGroup(() => {
            return thisColorGroup
          })

          activeColor = Object.keys(thisColorGroup)[0]

          setColor1(thisColorGroup[activeColor])
        }
      }
    }
  }

  const rePrintImage = () => {
    if (oImage) {
      const ctx = canvasRef.current!.getContext("2d");
      ctx!.imageSmoothingEnabled = false
      ctx!.clearRect(0, 0, oImage.width, oImage.height)
      ctx!.drawImage(oImage!, 0, 0);

      const posCount: number = oImage.width * oImage.height

      // saveImageDate()
      saveImageDate2()
      // saveImageDate3()

      // console.log(colorDict)

      const thisColorGroup: { [key: string]: ColorResult["rgb"] } = {}
      // createColorGroup(thisColorGroup, posCount)
      createColorGroup2(thisColorGroup, posCount)
      // createColorGroup3(thisColorGroup, posCount)

      setColorGroup(() => {
        return thisColorGroup
      })

      activeColor = Object.keys(thisColorGroup)[0]

      setColor1(thisColorGroup[activeColor])
    }

  }

  const saveImageDate = () => {
    colorDict = {}
    const canvas = canvasRef.current
    const width = canvas!.width, height = canvas!.height
    const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width, height)
    const data = imageData.data;
    // const colorDict : {[key:string]: any} = {};
    for (let i = 0; i < width * height * 4; i += 4) {
      const colorString = data[i] + "," + data[i + 1] + "," + data[i + 2] + "," + data[i + 3];
      // if (data[i + 3] != 255 || colorString  == "0,0,0,0" || colorString == "255,0,0,1") {
      //   continue;
      // }
      if (colorString == "0,0,0,0" || colorString == "255,0,0,1" || colorString == "255,0,255,1" || colorString == "255,255,0,1" || colorString == "0,0,0,1") {
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

  const createColorGroup = (thisColorGroup: { [key: string]: ColorResult["rgb"] }, posCount: number) => {
    for (let i in colorDict) {
      // if (colorDict[i].length >= posCount/1000 && i.split(",")[3] == "255") {
      const l = i.split(",")
      thisColorGroup[i] = {r: parseInt(l[0]), g: parseInt(l[1]), b: parseInt(l[2]), a: parseInt(l[3])}
      // }
    }
    let tempCD: { [key: string]: any } = {}
    let unMatchCount: number = 0
    for (let i in colorDict) {
      if (colorDict[i].length < posCount / 1000 || i.split(",")[3] != "255") {
        const l = i.split(",")
        // thisColorGroup[i] = {r: parseInt(l[0]), g: parseInt(l[1]), b: parseInt(l[2])}
        const r = parseInt(l[0]), g = parseInt(l[1]), b = parseInt(l[2]), a = parseInt(l[3])
        // let temp = "";
        let unMatch = true;
        for (let key in thisColorGroup) {
          let thisColor = thisColorGroup[key]
          // temp = key;
          if (isNearColor(thisColor, {r: r, g: g, b: b, a: a})) {
            colorDict[key].push(...colorDict[i])
            unMatch = false;
            break;
          }

        }
        // if (unMatch) {
        //   tempCD[i] = [colorDict[i], colorDict[i].length]
        //   unMatchCount += colorDict[i].length
        // }
      }
    }

    let temp1 = 0
    for (let k in tempCD) {
      temp1 += tempCD[k][1]
    }
  }


  const createColorGroup2 = (thisColorGroup: { [key: string]: ColorResult["rgb"] }, posCount: number) => {
    for (let i in colorDict) {
      if (colorDict[i].length >= posCount/1000) {
        const l = i.split(",")
        thisColorGroup[i] = {r: parseInt(l[0]), g: parseInt(l[1]), b: parseInt(l[2]), a: parseInt(l[3])}
      }
    }
    // let tempCD : {[key:string]: any} = {}
    // let unMatchCount : number = 0
    // for (let i in colorDict) {
    //   if (i.split(",")[3] != "255") {
    //     const l = i.split(",")
    // thisColorGroup[i] = {r: parseInt(l[0]), g: parseInt(l[1]), b: parseInt(l[2])}
    // const r = parseInt(l[0]), g = parseInt(l[1]), b = parseInt(l[2]), a = parseInt(l[3])
    // let temp = "";
    // let unMatch = true;
    // for (let key in thisColorGroup) {
    //   let thisColor = thisColorGroup[key]
    //   // temp = key;
    //   if (isNearColor(thisColor, {r: r, g:g, b:b, a:a})) {
    //     colorDict[key].push(...colorDict[i])
    //     unMatch = false;
    //     break;
    //   }
    //
    // }
    // if (unMatch) {
    //   tempCD[i] = [colorDict[i], colorDict[i].length]
    //   unMatchCount += colorDict[i].length
    // }
    //   }
    // }
    // let temp1 = 0
    // for (let k in tempCD) {
    //   temp1 += tempCD[k][1]
    // }
  }

  function saveImageDate2() {
    const canvas = canvasRef.current
    const width = canvas!.width, height = canvas!.height
    const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width, height)
    const data = imageData.data;
    // const colorDict : {[key:string]: any} = {};
    colorDict = {}
    for (let i = 0; i < width * height * 4; i += 4) {
      const colorString = data[i] + "," + data[i + 1] + "," + data[i + 2] + "," + data[i + 3];
      // if (data[i + 3] != 255 || colorString  == "0,0,0,0" || colorString == "255,0,0,1") {
      //   continue;
      // }
      if (colorString == "0,0,0,0" || colorString == "255,0,0,1" || colorString == "255,0,255,1" || colorString == "255,255,0,1" || colorString == "0,0,0,1") {
        continue;
      }
      if (colorString in colorDict) {
        colorDict[colorString].push(i);
      } else {
        colorDict[colorString] = [i];
      }
    }
  }

  const colorChange = (color: ColorResult["rgb"], colorDictKey: string) => {
    const canvas = canvasRef.current
    const width = canvas!.width, height = canvas!.height
    // console.log(width, height)

    const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width, height)
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
        data[posX + 1] = color.g;
        data[posX + 2] = color.b;
        data[posX + 3] = 255;
      }
    }

    canvas!.getContext('2d')!.putImageData(imageData, 0, 0);
  }

  // 卷积计算
  const convolutionMatrix = (input: ImageData, kernel: any) => {
    let w = input.width, h = input.height;
    let oldDate = input.data.map(e=>e)
    let iD = input.data
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        for (let c = 0; c < 3; c += 1) {
          let i = (y * w + x) * 4 + c;
          // console.log(i)
          iD[i] = kernel[0] * oldDate[i - w * 4 - 4] +
            kernel[1] * oldDate[i - w * 4] +
            kernel[2] * oldDate[i - w * 4 + 4] +
            kernel[3] * oldDate[i - 4] +
            kernel[4] * oldDate[i] +
            kernel[5] * oldDate[i + 4] +
            kernel[6] * oldDate[i + w * 4 - 4] +
            kernel[7] * oldDate[i + w * 4] +
            kernel[8] * oldDate[i + w * 4 + 4]
        }
        if (kernel == kernel2) {
          iD[(y * w + x) * 4 + 3] = 255;
        }

      }
    }
    // return output;
  }

  const kernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1]; // 锐化卷积核
  const kernel2 = [-1, -1, -1, -1, 8, -1, -1, -1, -1]; // 边缘检测
  const kernel3 = [0,0,0,0,1,0,0,0,0]; // 边缘检测

  const ruihua = () => {
    // let output = new ImageData()
    // convolutionMatrix()

    const canvas = canvasRef.current
    const width = canvas!.width, height = canvas!.height
    // console.log(width, height)

    const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width, height)
    // setColorGroup({...colorGroup, colorString: color})
    // console.log("colorchangeFun", colorDict)
    convolutionMatrix(imageData, kernel)

    canvas!.getContext('2d')!.putImageData(imageData, 0, 0);
    // console.log(imageData)
  }

  const bianyuan = () => {
    // let output = new ImageData()
    // convolutionMatrix()

    const canvas = canvasRef.current
    const width = canvas!.width, height = canvas!.height
    // console.log(width, height)

    const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width, height)

    // setColorGroup({...colorGroup, colorString: color})

    // console.log("colorchangeFun", colorDict)

    convolutionMatrix(imageData, kernel2)

    canvas!.getContext('2d')!.putImageData(imageData, 0, 0);
    // console.log(imageData)
  }

  useEffect(() => {
    // console.log('colorGroupEf', colorGroup)
  }, [colorGroup]);

  useEffect(() => {
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

  const resetColor = (colorString: string) => {
    // activeColor = colorString
    const colorStringList = colorString.split(",")
    const color = {r: parseInt(colorStringList[0]),g: parseInt(colorStringList[1]),b: parseInt(colorStringList[2]), a:255}
    // let tempColorGroup = {...colorGroup}
    // tempColorGroup[colorString] = color
    // setColorGroup(tempColorGroup)
    selectColor(color, colorString)
    // console.log(colorString,1111)
  }

  const save = () => {
    // const ctx = canvasRef.current!.getContext("2d");

    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png", 1.0)

      const a = document.createElement('a')
      a.href = url
      a.download = outputFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const save2 = () => {
    // const ctx = canvasRef.current!.getContext("2d");

    if (canvasRef.current && canvasRef2.current) {
      canvasRef2.current!.width = canvasRef.current!.width;
      canvasRef2.current!.height = canvasRef.current!.height;
      canvasRef2.current.getContext('2d')!.drawImage(canvasRef.current, 0, 0)
      const url = canvasRef2.current.toDataURL("image/png", 1.0)

      const a = document.createElement('a')
      a.href = url
      a.download = `untitled.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const redFilter = () => {
    const canvas = canvasRef.current
    const width = canvas!.width, height = canvas!.height

    if (tempImageData) {
      removeFilter();
    }

    const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width, height)
    const data = imageData.data;

    tempImageData = imageData.data.map(e=>e);

    for (let key in colorDict) {
      for (let i = 0; i < colorDict[key].length; i++) {
        const posX = colorDict[key][i]
        data[posX + 1] = 0;
        data[posX + 2] = 0;
        data[posX + 3] = 255;
      }
    }

    canvas!.getContext('2d')!.putImageData(imageData, 0, 0);
  }

  const greenFilter = () => {
    const canvas = canvasRef.current
    const width = canvas!.width, height = canvas!.height

    if (tempImageData) {
      removeFilter();
    }

    const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width, height)
    const data = imageData.data;

    tempImageData = imageData.data.map(e=>e);

    for (let key in colorDict) {
      for (let i = 0; i < colorDict[key].length; i++) {
        const posX = colorDict[key][i]
        data[posX] = 0;
        data[posX + 2] = 0;
        data[posX + 3] = 255;
      }
    }

    canvas!.getContext('2d')!.putImageData(imageData, 0, 0);
  }

  const blueFilter = () => {
    const canvas = canvasRef.current
    const width = canvas!.width, height = canvas!.height

    if (tempImageData) {
      removeFilter();
    }

    const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width, height)
    const data = imageData.data;

    tempImageData = imageData.data.map(e=>e);

    for (let key in colorDict) {
      for (let i = 0; i < colorDict[key].length; i++) {
        const posX = colorDict[key][i]
        data[posX] = 0;
        data[posX + 1] = 0;
        data[posX + 3] = 255;
      }
    }

    canvas!.getContext('2d')!.putImageData(imageData, 0, 0);
  }

  const garyFilter = () => {
    const canvas = canvasRef.current
    const width = canvas!.width, height = canvas!.height

    if (tempImageData) {
      removeFilter();
    }

    const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width, height)
    const data = imageData.data;

    tempImageData = imageData.data.map(e=>e);


    for (let key in colorDict) {
      for (let i = 0; i < colorDict[key].length; i++) {
        const posX = colorDict[key][i]
        let newColor = Math.round((data[posX] + data[posX+1] + data[posX+2]) / 3);
        data[posX] = newColor;
        data[posX + 1] = newColor;
        data[posX + 2] = newColor;
        data[posX + 3] = 255;
      }
    }

    canvas!.getContext('2d')!.putImageData(imageData, 0, 0);
  }

  const removeFilter = () => {
    if (tempImageData) {

      const canvas = canvasRef.current;
      const width = canvas!.width, height = canvas!.height
      const imageData = canvas!.getContext('2d')!.getImageData(0, 0, width, height)
      const data = imageData.data;

      for (let key in colorDict) {
        for (let i = 0; i < colorDict[key].length; i++) {
          const posX = colorDict[key][i]
          data[posX] = tempImageData[posX];
          data[posX + 1] = tempImageData[posX + 1];
          data[posX + 2] = tempImageData[posX + 2];
          data[posX + 3] = 255;
        }
      }

      tempImageData = null;
      canvas!.getContext('2d')!.putImageData(imageData, 0, 0);
    }

  }

  return (
    <Layout>
      <Header>
        <Upload customRequest={uploadPrinting2} showUploadList={false}
                accept="image/png
                ">
          <Button type="primary">导入印花</Button>
        </Upload>
        <Button style={{marginLeft: 50}} icon={<UndoOutlined />} onClick={rePrintImage}>复原印花</Button>
        <Button style={{marginLeft: 20}} onClick={save}>保存</Button>


        {/*<Button style={{marginLeft: 50}} onClick={save2}>保存2</Button>*/}
      </Header>
      <Layout>
        <Sider trigger={null} width={220}>
          <SketchPicker color={color1} onChange={(color) => {
            setColor1(color.rgb)
          }}/>
          <div>
            <ColorDiv colorGroup={colorGroup} selectColor={selectColor} resetColor={resetColor}/>
          </div>
        </Sider>
        <Layout style={{border: "5px #888888 solid", minHeight: 800, overflow: "auto", backgroundColor: "white"}}>
          <Header style={{background: "#BEBEAB", height: "38px", lineHeight: "38px", textAlign: "left"}}>
            <Button onClick={redFilter}>红色滤镜</Button>
            <Button style={{marginLeft: 20}} onClick={greenFilter}>绿色滤镜</Button>
            <Button style={{marginLeft: 20}} onClick={blueFilter}>蓝色滤镜</Button>
            <Button style={{marginLeft: 20}} onClick={garyFilter}>灰色滤镜</Button>
            <Button style={{marginLeft: 20}} onClick={removeFilter}>去除滤镜</Button>
            <Button style={{marginLeft: 20}} onClick={ruihua}>锐化</Button>
            <Button style={{marginLeft: 20}} onClick={bianyuan}>边缘检测</Button>
          </Header>
          <div className="App">
            {/*<input type="file" onChange={upload}/>*/}
            {/*<input id="canvas" type="file" onChange={uploadPrinting}/>*/}

            {/*<button onClick={showColor}>showColor</button>*/}
            <canvas id={"canvas"} ref={canvasRef}/>
            <canvas id={"canvas2"} ref={canvasRef2}/>
            {/*style={{display: "None"}}*/}
          </div>
        </Layout>
      </Layout>


    </Layout>
  )
}

const ColorDiv = (props: any) => {
  // console.log(props)
  // const a = [1,1,2]
  // console.log(props.colorGroup)
  //
  const colorStyle = {
    width: '50px',
    height: '20px',
    borderRadius: '2px',

  }

  const swatchStyle = {
    padding: '5px',
    background: '#fff',
    borderRadius: '3px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    cursor: 'pointer',
  }

  return <div>
    {Object.keys(props.colorGroup).map((value, index) => {
      return <div key={index} style={{width: 90, height: 32, margin: "6px", float: "left", display: "flex"}}>
        <div style={swatchStyle}>
          <div style={{
            ...colorStyle,
            background: `rgba(${props.colorGroup[value].r}, ${props.colorGroup[value].g},${props.colorGroup[value].b},${props.colorGroup[value].a})`
          }}
               onClick={() => {
                 props.selectColor(props.colorGroup[value], value)
               }}/>

        </div>
        <Button icon={<UndoOutlined />} onClick={()=>{props.resetColor(value)}}/>
      </div>
    })}
  </div>
}


export default Printing