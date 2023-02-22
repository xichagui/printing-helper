import React, {useEffect, useRef, useState} from 'react'
import './App.css'
import printing2 from '../public/印花2.png'

import {readPsd} from 'ag-psd';
// import {fabric} from 'fabric';
import {ColorResult, RGBColor, SketchPicker} from 'react-color'
import {Button, Layout, Upload} from "antd";
import {UndoOutlined} from "@ant-design/icons";

const {Header, Content, Sider} = Layout;

import convert from 'color-convert'
import {Simulate} from "react-dom/test-utils";
import invalid = Simulate.invalid;

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
  const printingCanvasRef1 = useRef<HTMLCanvasElement>(null);
  const printingCanvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);

  const [printingList, setPrintingList] = useState<Array<HTMLCanvasElement|HTMLImageElement>>([])

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
    document.title = '印花排版软件';
    const options = {"width": 1280, "height": 720}
    // const canvas = new fabric.Canvas(canvasRef.current, options)
    window.addEventListener('resize', resizeCanvas2)

    return () => {
      // if (canvas) {
      //   // canvas.dispose();
      //   delete appContext.canvas;
      // }
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
    const file = props.file;

    if (window.FileReader) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = (e) => {

        const url = reader.result as string;
        // const ctx = printingCanvasRef2.current!.getContext("2d");
        // ctx!.imageSmoothingEnabled = false
        let img = new Image();
        img.src = url;
        img.onload = function () {
          setPrintingList([...printingList, img])
        }
      }
    }
  }

  const rePrintImage = () => {
    if (oImage) {
      const ctx = printingCanvasRef1.current!.getContext("2d");
      ctx!.imageSmoothingEnabled = false
      ctx!.clearRect(0, 0, oImage.width, oImage.height)
      copyToCanvas2()
      ctx!.drawImage(oImage!, 0, 0);

      const posCount: number = oImage.width * oImage.height

      // saveImageDate()
      // saveImageDate2()
      // saveImageDate3()


      copyToCanvas2()
    }

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


  const save = () => {
    // const ctx = canvasRef.current!.getContext("2d");

    if (printingCanvasRef1.current) {
      const url = printingCanvasRef1.current.toDataURL("image/png", 1.0)

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

    if (printingCanvasRef1.current && canvasRef2.current) {
      canvasRef2.current!.width = printingCanvasRef1.current!.width;
      canvasRef2.current!.height = printingCanvasRef1.current!.height;
      canvasRef2.current.getContext('2d')!.drawImage(printingCanvasRef1.current, 0, 0)
      const url = canvasRef2.current.toDataURL("image/png", 1.0)

      const a = document.createElement('a')
      a.href = url
      a.download = outputFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const copyToCanvas2 = () => {
    if (canvasRef2.current) {
      const canvas2 = canvasRef2.current.getContext('2d')
      canvas2!.imageSmoothingEnabled = false
      const canvas = printingCanvasRef1.current
      const width = canvas!.width, height = canvas!.height

      // let canvas = canvasRef!.current!.getContext('2d')
      canvas2!.drawImage(printingCanvasRef1.current!, 0, 0, canvas2Size, canvas2Size)
      console.log("copyToCanvas2")
    }
  }

  const drawToCanvas3 = (printing: HTMLCanvasElement | HTMLImageElement, clear:boolean, dx: number, dy: number, dw: number, dh: number, px: number, py: number, angle: number = 0) => {
    if (canvasRef3.current && printing) {
      const canvas3 = canvasRef3.current.getContext('2d')
      if (clear) {
        canvas3!.clearRect(0,0,1000,1000)
      }
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = dw
      tempCanvas.height = dh

      const tempCtx = tempCanvas.getContext('2d')
      if (angle) {
        tempCtx!.translate(dw/2, dh/2)
        tempCtx!.rotate(Math.PI*angle/180)
        tempCtx!.drawImage(printing, -(dw/2), -(dh/2), dw, dh)
      } else {
        tempCtx!.drawImage(printing, 0, 0, dw, dh)
      }



      if (canvas3) {
        for (let i = dx; i < 1000; i+=(dw+px) ) {
          for (let j = dy; j < 1000; j+=(dh+py)) {
            canvas3.save()
            canvas3.translate(i,j)
            canvas3.drawImage(tempCanvas, 0, 0, dw, dh)
            canvas3.restore()
          }
        }
      }
    }
  }

  const pingpu1 = () => {
    let dx1 = -50, dy1 = -50, dw1 = 100, dh1 = 100, px1 = 100, py1 = 100
    let dx2 = 25, dy2 = 25, dw2 = 150, dh2 = 150, px2 = 50, py2 = 50
    drawToCanvas3(printingList[0], true, dx1, dy1, dw1, dh1, px1, py1)
    drawToCanvas3(printingList[1], false, dx2, dy2, dw2, dh2, px2, py2)
  }

  const pingpu2 = () => {
    let dx1 = -50, dy1 = -50, dw1 = 100, dh1 = 100, px1 = 100, py1 = 100
    let dx2 = 25, dy2 = 25, dw2 = 150, dh2 = 150, px2 = 50, py2 = 50
    drawToCanvas3(printingList[0], true, dx1, dy1, dw1, dh1, px1, py1, 45)
    drawToCanvas3(printingList[1], false, dx2, dy2, dw2, dh2, px2, py2, 45)
  }

  return (
    <Layout>
      <Header>
        <Upload customRequest={uploadPrinting} showUploadList={false}
                accept="image/png
                ">
          <Button type="primary">导入印花</Button>
        </Upload>
        {/*<Upload customRequest={uploadPrinting2} showUploadList={false}*/}
        {/*        accept="image/png*/}
        {/*        ">*/}
        {/*  <Button type="primary">导入印花2</Button>*/}
        {/*</Upload>*/}
        <Button style={{marginLeft: 50}} icon={<UndoOutlined />} onClick={rePrintImage}>复原印花</Button>
        <Button style={{marginLeft: 20}} onClick={save}>保存</Button>
        <Button style={{marginLeft: 20}} onClick={pingpu1}>平铺</Button>
        <Button style={{marginLeft: 20}} onClick={pingpu2}>平铺</Button>
        {/*<Button style={{marginLeft: 50}} onClick={save2}>保存2</Button>*/}
      </Header>
      <Layout>
        <Sider trigger={null} width={220}>
          {/*<SketchPicker color={color1} onChange={(color) => {*/}
          {/*  setColor1(color.rgb)*/}
          {/*}}/>*/}
          {/*<div id="printing-list">*/}
          {/*  /!*<ColorDiv colorGroup={colorGroup} selectColor={selectColor} resetColor={resetColor}/>*!/*/}
          {/*  <div><img src={printing2} alt=""/></div>*/}
          {/*  <div><img src={printing2} alt=""/></div>*/}
          {/*  /!*<div><img src={"https://picx.zhimg.com/v2-10d4f9beb38eab3b0aec1a8b12695a57_1440w.jpg?source=172ae18b"} alt=""/></div>*!/*/}

          {/*  <div><canvas></canvas></div>*/}
          {/*</div>*/}
          <PrintingList printingList={printingList}/>
        </Sider>
        <Layout style={{border: "5px #888888 solid", minHeight: 800, overflow: "auto", backgroundColor: "white"}}>
          <Header style={{background: "#BEBEAB", height: "38px", lineHeight: "38px", textAlign: "left"}}>
            {/*<Button style={{marginLeft: 20}} onClick={()=>{console.log(111)}}>去除滤镜</Button>*/}
          </Header>
          <div className="App">
            {/*<input type="file" onChange={upload}/>*/}
            {/*<input id="canvas" type="file" onChange={uploadPrinting}/>*/}

            {/*<button onClick={showColor}>showColor</button>*/}
            <canvas id={"canvas"} ref={printingCanvasRef1} style={{display: "none"}}/>
            {/*<canvas id={"canvas2"} ref={canvasRef2} width={canvas2Size} height={canvas2Size}/>*/}
            <canvas id={"canvas3"} ref={canvasRef3} width={1000} height={1000} style={{border: "1px #000 solid"}}/>
            {/*style={{display: "None"}}*/}
          </div>
        </Layout>
      </Layout>


    </Layout>
  )
}

const PrintingList = (props: any) => {
  const list = props.printingList as Array<HTMLCanvasElement|HTMLImageElement>
  return <div id="printing-list">
    {list.map(( value,index)=> {
      if ("src" in value) {
        return <div key={index}><img src={value.src} alt=""/></div>
      }
      })
    }
  </div>
}

export default Printing