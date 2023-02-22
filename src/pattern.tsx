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

let canvas2Size = 500
let canvas3Size = 800

const Printing = () => {

  // let ac = convert.rgb.cmyk(255,0,0)
  // console.log(ac)
  // console.log(convert.cmyk.rgb(ac))
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);


  const resizeCanvas2 = () => {
    const minWH =  document.body.offsetWidth < document.body.offsetHeight ? document.body.offsetWidth : document.body.offsetHeight;
    if (canvasRef2.current) {
      // console.log(canvasRef2)
      canvas2Size = Math.floor((minWH - 100) / 10) * 10
      canvasRef2.current!.height = canvas2Size;
      canvasRef2.current!.width = canvas2Size;
      copyToCanvas2()
    }
  }

  useEffect(() => {
    const options = {"width": 1280, "height": 720}
    // const canvas = new fabric.Canvas(canvasRef.current, options)
    const canvas = canvasRef.current
    appContext.canvas = canvasRef.current;
    window.addEventListener('resize', resizeCanvas2)

    return () => {
      if (canvas) {
        // canvas.dispose();
        delete appContext.canvas;
      }
      window.removeEventListener('resize', resizeCanvas2)
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
          // saveImageDate3()
          // console.log(colorDict)
          // createColorGroup2(thisColorGroup, posCount)
          // createColorGroup3(thisColorGroup, posCount)

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
          copyToCanvas2()
        }
      }
    }
  }

  const rePrintImage = () => {
    if (oImage) {
      const ctx = canvasRef.current!.getContext("2d");
      ctx!.imageSmoothingEnabled = false
      ctx!.clearRect(0, 0, oImage.width, oImage.height)
      copyToCanvas2()
      ctx!.drawImage(oImage!, 0, 0);

      const posCount: number = oImage.width * oImage.height

      // saveImageDate()
      saveImageDate2()
      // saveImageDate3()


      copyToCanvas2()
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
      a.download = outputFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
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

  const copyToCanvas2 = () => {
    if (canvasRef2.current) {
      const canvas2 = canvasRef2.current.getContext('2d')
      canvas2!.imageSmoothingEnabled = false
      const canvas = canvasRef.current
      const width = canvas!.width, height = canvas!.height

      // let canvas = canvasRef!.current!.getContext('2d')
      canvas2!.drawImage(canvasRef.current!, 0, 0, canvas2Size, canvas2Size)
      console.log("copyToCanvas2")
    }
  }

  const drawToCanvas3 = (printing: HTMLCanvasElement | null, clear:boolean, dx: number, dy: number, dw: number, dh: number, px: number, py: number) => {
    if (canvasRef3.current && printing) {
      const canvas3 = canvasRef3.current.getContext('2d')
      if (clear) {
        canvas3!.clearRect(0,0,1000,1000)
      }
      for (let i = dx; i < 1000; i+=(dw+px) ) {
        for (let j = dy; j < 1000; j+=(dh+py)) {
          canvas3!.drawImage(printing, i, j, dw, dh)
          console.log(i,j)

        }
      }
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
        <Button style={{marginLeft: 20}} onClick={()=>{drawToCanvas3(canvasRef.current, true,-50,-50,100,100,100,100)}}>平铺</Button>
        <Button style={{marginLeft: 20}} onClick={()=>{drawToCanvas3(canvasRef.current, false,25,25,150,150,50,50)}}>平铺</Button>
        {/*<Button style={{marginLeft: 50}} onClick={save2}>保存2</Button>*/}
      </Header>
      <Layout>
        <Sider trigger={null} width={220}>
          {/*<SketchPicker color={color1} onChange={(color) => {*/}
          {/*  setColor1(color.rgb)*/}
          {/*}}/>*/}
          <div>
            {/*<ColorDiv colorGroup={colorGroup} selectColor={selectColor} resetColor={resetColor}/>*/}
          </div>
        </Sider>
        <Layout style={{border: "5px #888888 solid", minHeight: 800, overflow: "auto", backgroundColor: "white"}}>
          <Header style={{background: "#BEBEAB", height: "38px", lineHeight: "38px", textAlign: "left"}}>
            <Button style={{marginLeft: 20}} onClick={removeFilter}>去除滤镜</Button>
          </Header>
          <div className="App">
            {/*<input type="file" onChange={upload}/>*/}
            {/*<input id="canvas" type="file" onChange={uploadPrinting}/>*/}

            {/*<button onClick={showColor}>showColor</button>*/}
            <canvas id={"canvas"} ref={canvasRef} style={{display: "none"}}/>
            {/*<canvas id={"canvas2"} ref={canvasRef2} width={canvas2Size} height={canvas2Size}/>*/}
            <canvas id={"canvas3"} ref={canvasRef3} width={1000} height={1000} style={{border: "1px #000 solid"}}/>
            {/*style={{display: "None"}}*/}
          </div>
        </Layout>
      </Layout>


    </Layout>
  )
}


export default Printing