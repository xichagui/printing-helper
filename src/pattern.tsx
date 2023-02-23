import React, {useEffect, useReducer, useRef, useState} from 'react'
import './App.css'

import {Button, Checkbox, Form, Input, InputNumber, Layout, Radio, Switch, Upload} from "antd";
import {UndoOutlined} from "@ant-design/icons";

const {Header, Content, Sider} = Layout;


let oImage : HTMLImageElement | null = null;

let outputFilename : string = 'untitled';

let canvas2Size = 500
let canvas3Size = 800

let outputCanvasSize: Array<number> = [1000, 1000]

interface PrintingOptions {
  dw: number, // 图宽
  dh: number, // 图高
  dx: number, // 偏移值
  dy: number, // 便宜值
  px: number, // 横向间隔
  py: number, // 纵向间隔
  angle: number, // 角度
  verticalFlip: boolean, // 水平翻转
  horizontalFlip: boolean, //垂直翻转
  flipIntervals: number, //翻转间隔
}

interface ReducerInit {
  key : string,
  value: any,
}
const printingOptionsList : Array<PrintingOptions>= []

const Printing = () => {

  // let ac = convert.rgb.cmyk(255,0,0)
  // console.log(ac)
  // console.log(convert.cmyk.rgb(ac))
  const printingCanvasRef1 = useRef<HTMLCanvasElement>(null);
  const printingCanvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);

  const [printingList, setPrintingList] = useState<Array<HTMLCanvasElement|HTMLImageElement>>([])
  const [activePrintingIndex, setActivePrintingIndex] = useState<number>(-1);

  // const optionReducer = (state: PrintingOptions, action: any) => {
  //   switch (action.type) {
  //     case "patch":
  //       return {...state, ...action.optionState};
  //     case "reset":
  //       return printingOptions;
  //     default:
  //       throw new Error("unknown type!");
  //   }
  // }
  //
  // const [optionState, optionsDispatch] = useReducer(optionReducer, printingOptions);

  const [form] = Form.useForm();

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

  useEffect(()=> {
    setActivePrintingIndex(0)
  },[printingList])

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

          printingOptionsList.push({
            dw: img.width,
            dh: img.height,
            dx:0,
            dy:0,
            angle:0,
            px:0,
            py:0,
            flipIntervals:0,
            horizontalFlip: false,
            verticalFlip: false
          })

          form.setFieldsValue(printingOptionsList[printingOptionsList.length - 1])
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

      copyToCanvas2()
    }

  }

  const save = () => {
    // const ctx = canvasRef.current!.getContext("2d");

    if (canvasRef1.current) {
      const url = canvasRef1.current.toDataURL("image/png", 1.0)

      const a = document.createElement('a')
      a.href = url
      a.download = '打印花纹'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const save2 = () => {

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

  const setActivePrinting = (index: number) => {
    setActivePrintingIndex(index)
    form.setFieldsValue(printingOptionsList[index])
    // console.log(printingOptionsList)
  }

  const drawToCanvas3 = (printing: HTMLCanvasElement | HTMLImageElement, clear:boolean, dx: number, dy: number, dw: number, dh: number, px: number, py: number, angle: number, verticalFlip: boolean, horizontalFlip: boolean) => {
    if (canvasRef3.current && printing) {
      const canvas3Ctx = canvasRef3.current.getContext('2d')
      if (clear) {
        canvas3Ctx!.clearRect(0,0,1000,1000)
      }
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = dw
      tempCanvas.height = dh

      const tempCtx = tempCanvas.getContext('2d')

      if (horizontalFlip) {
        tempCtx!.translate(dw, 0)
        tempCtx!.scale(-1, 1)
      }
      if (verticalFlip) {
        tempCtx!.translate(0, dh)
        tempCtx!.scale(1, -1)
      }
      if (angle) {
        tempCtx!.translate(dw/2, dh/2)
        tempCtx!.rotate(Math.PI*angle/180)
        tempCtx!.drawImage(printing, -(dw/2), -(dh/2), dw, dh)
      } else {
        tempCtx!.drawImage(printing, 0, 0, dw, dh)
      }


      if (canvas3Ctx) {
        for (let i = dx; i <= 1000; i+=(dw+px) ) {
          for (let j = dy; j <= 1000; j+=(dh+py)) {
            canvas3Ctx.save()
            canvas3Ctx.translate(i,j)
            canvas3Ctx.drawImage(tempCanvas, 0, 0, dw, dh)
            canvas3Ctx.restore()
          }
        }
      }
    }
  }

  const setCanvas1 = (width: number, height: number) => {
    canvasRef1!.current!.height = height
    canvasRef1!.current!.width = width
  }

  const drawToCanvas1 = (printing: HTMLCanvasElement | HTMLImageElement, clear:boolean, dx: number, dy: number, dw: number, dh: number, px: number, py: number, angle: number, verticalFlip: boolean, horizontalFlip: boolean) => {
    if (canvasRef1.current && printing) {
      const canvas1 = canvasRef1.current
      const canvas1Ctx = canvas1.getContext('2d')
      if (clear) {
        canvas1Ctx!.clearRect(0,0,canvas1.width, canvas1.height)
      }

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = dw
      tempCanvas.height = dh

      const tempCtx = tempCanvas.getContext('2d')

      if (horizontalFlip) {
        tempCtx!.translate(dw, 0)
        tempCtx!.scale(-1, 1)
      }
      if (verticalFlip) {
        tempCtx!.translate(0, dh)
        tempCtx!.scale(1, -1)
      }
      if (angle) {
        tempCtx!.translate(dw/2, dh/2)
        tempCtx!.rotate(Math.PI*angle/180)
        tempCtx!.drawImage(printing, -(dw/2), -(dh/2), dw, dh)
      } else {
        tempCtx!.drawImage(printing, 0, 0, dw, dh)
      }

      if (canvas1Ctx) {
        for (let i = dx; i <= canvas1.width; i+=(dw+px) ) {
          for (let j = dy; j <= canvas1.height; j+=(dh+py)) {
            canvas1Ctx.save()
            canvas1Ctx.translate(i,j)
            canvas1Ctx.drawImage(tempCanvas, 0, 0, dw, dh)
            canvas1Ctx.restore()
          }
        }
      }
    }
  }

  const drawPrinting = () => {
    // let dx1 = -50, dy1 = -50, dw1 = 100, dh1 = 100, px1 = 100, py1 = 100
    // let dx2 = 25, dy2 = 25, dw2 = 150, dh2 = 150, px2 = 50, py2 = 50
    // drawToCanvas3(printingList[0], true, dx1, dy1, dw1, dh1, px1, py1)
    // drawToCanvas3(printingList[1], false, dx2, dy2, dw2, dh2, px2, py2)
    // const canvas3 = canvasRef3!.current!.getContext('2d')
    // canvas3!.clearRect(0,0,1000,1000)
    // let isNew = true

    for (let i = 0; i < printingList.length; i++) {
      let op = printingOptionsList[i]
      drawToCanvas3(printingList[i], i==0, op.dx, op.dy, op.dw, op.dh, op.px, op.py, op.angle, op.verticalFlip, op.horizontalFlip)
    }

    let maxW = 0, maxH = 0;
    for (let i = 0; i < printingList.length; i++) {
      maxW = Math.max(maxW, printingOptionsList[i].dw + printingOptionsList[i].px)
      maxH = Math.max(maxW, printingOptionsList[i].dh + printingOptionsList[i].py)
    }
    setCanvas1(maxW, maxH)

    for (let i = 0; i < printingList.length; i++) {
      let op = printingOptionsList[i]
      drawToCanvas1(printingList[i], i==0, op.dx, op.dy, op.dw, op.dh, op.px, op.py, op.angle, op.verticalFlip, op.horizontalFlip)
    }
  }

  const danHuaPingPu = () => {
    let op = printingOptionsList[0]
    drawToCanvas3(printingList[0], true, 0, 0, 100, 100, 0, 0, op.angle, op.verticalFlip, op.horizontalFlip)

    setCanvas1(op.dw, op.dh)

    drawToCanvas1(printingList[0], true, 0, 0, op.dw, op.dh, 0, 0, op.angle, op.verticalFlip, op.horizontalFlip)
  }

  const danHuaYiBeiPingPu = () => {
    let op = printingOptionsList[0]
    drawToCanvas3(printingList[0], true, 0,0, 100, 100, 100, 100, op.angle, op.verticalFlip, op.horizontalFlip)

    let op0 = printingOptionsList[0]
    setCanvas1(op0.dw + op0.dw, op0.dh + op0.dh)

    drawToCanvas1(printingList[0], true, 0, 0, op.dw, op.dh, op.dw, op.dh, op.angle, op.verticalFlip, op.horizontalFlip)
  }

  const shuangHuaPingPu = () => {
    if (printingOptionsList.length > 1) {
      let op = printingOptionsList[0]
      drawToCanvas3(printingList[0], true, -50, -50, 100, 100, 100, 100, op.angle, op.verticalFlip, op.horizontalFlip)
      let op1 = printingOptionsList[1]
      drawToCanvas3(printingList[1], false, 50, 50, 100, 100, 100, 100, op1.angle, op1.verticalFlip, op1.horizontalFlip)

      setCanvas1(op.dw + op.dw, op.dh + op.dh)

      drawToCanvas1(printingList[0], true, -(op.dw/2), -(op.dh/2), op.dw, op.dh, op.dw, op.dh, op.angle, op.verticalFlip, op.horizontalFlip)
      drawToCanvas1(printingList[1], false, (op.dw*2-op1.dw)/2, (op.dh*2-op1.dh)/2, op1.dw, op1.dh, op.dw+op.dw-op1.dw, op.dh+op.dh-op1.dh, op1.angle, op1.verticalFlip, op1.horizontalFlip)
    }
  }

  const shuangHuaYiBeiPingPu = () => {
    if (printingOptionsList.length > 1) {
      let op = printingOptionsList[0]
      drawToCanvas3(printingList[0], true, -50, -50, 100, 100, 200, 200, op.angle, op.verticalFlip, op.horizontalFlip)
      let op1 = printingOptionsList[1]
      drawToCanvas3(printingList[1], false, 100, 100, 100, 100, 200, 200, op1.angle, op1.verticalFlip, op1.horizontalFlip)

      setCanvas1(op.dw + op.dw * 2, op.dh + op.dh * 2)

      drawToCanvas1(printingList[0], true, -(op.dw/2), -(op.dh/2), op.dw, op.dh, op.dw*2, op.dh*2, op.angle, op.verticalFlip, op.horizontalFlip)
      drawToCanvas1(printingList[1], false, (op.dw*3-op1.dw)/2, (op.dh*3-op1.dh)/2, op1.dw, op1.dh, op.dw*3+op.dw-op1.dw, op.dh*3+op.dh-op1.dh, op1.angle, op1.verticalFlip, op1.horizontalFlip)
    }


  }

  const danHuaYiBeiZhengNiPingPu = () => {
    if (printingOptionsList.length > 0) {
      let op = printingOptionsList[0]
      drawToCanvas3(printingList[0], true, 0, 0, 100, 100, 100, 100, op.angle, op.verticalFlip, op.horizontalFlip)
      drawToCanvas3(printingList[0], false, 100, 100, 100, 100, 100, 100, op.angle, !op.verticalFlip, op.horizontalFlip)

      setCanvas1(op.dw + op.dw, op.dh + op.dh)
      drawToCanvas1(printingList[0], true, 0, 0, op.dw, op.dh, op.dw, op.dh, op.angle, op.verticalFlip, op.horizontalFlip)
      drawToCanvas1(printingList[0], false, op.dw, op.dh, op.dw, op.dh, op.dw, op.dh, op.angle, !op.verticalFlip, op.horizontalFlip)
    }
  }

  // const pingpu2 = () => {
  //   let dx1 = -50, dy1 = -50, dw1 = 100, dh1 = 100, px1 = 100, py1 = 100
  //   let dx2 = 25, dy2 = 25, dw2 = 150, dh2 = 150, px2 = 50, py2 = 50
  //   drawToCanvas3(printingList[0], true, dx1, dy1, dw1, dh1, px1, py1, 45)
  //   drawToCanvas3(printingList[1], false, dx2, dy2, dw2, dh2, px2, py2, 45)
  // }

  const reset = () => {
    canvasRef3!.current!.getContext('2d')!.clearRect(0,0,1000,1000)
    while (printingOptionsList.length > 0) {
      printingOptionsList.pop()
    }
    setPrintingList([])
    setActivePrinting(0)
    form.setFieldsValue({})
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
        <Button style={{marginLeft: 50}} icon={<UndoOutlined />} onClick={reset}>重置</Button>
        <Button style={{marginLeft: 20}} onClick={save}>保存</Button>
        <Button style={{marginLeft: 20}} onClick={drawPrinting}>绘制</Button>
        <Button style={{marginLeft: 20}} onClick={danHuaPingPu}>单花完全平铺</Button>
        <Button style={{marginLeft: 20}} onClick={danHuaYiBeiPingPu}>单花一倍平铺</Button>
        <Button style={{marginLeft: 20}} onClick={danHuaYiBeiZhengNiPingPu}>单花一倍正逆平铺</Button>
        <Button style={{marginLeft: 20}} onClick={shuangHuaPingPu}>双花平铺</Button>
        <Button style={{marginLeft: 20}} onClick={shuangHuaYiBeiPingPu}>双花一倍平铺</Button>

        {/*<Button style={{marginLeft: 20}} onClick={pingpu2}>平铺</Button>*/}
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
          <PrintingList printingList={printingList}
                        activePrintingIndex={activePrintingIndex}
                        printingOptionsList={printingOptionsList}
                        // setActivePrintingIndex={setActivePrintingIndex}
                        setActivePrinting={setActivePrinting}
                        form={form}
          />
        </Sider>
        <Layout style={{border: "5px #888888 solid", minHeight: 800, overflow: "auto", backgroundColor: "white"}}>
          <Header style={{background: "#BEBEAB", height: "80px", lineHeight: "38px", textAlign: "left"}}>
            {/*<Button style={{marginLeft: 20}} onClick={()=>{console.log(111)}}>去除滤镜</Button>*/}
            <Form name="printingOptionsFrom" layout="inline" form={form} style={{width: 1250, lineHeight: 400}} onValuesChange={(changedValues, allValues)=>{printingOptionsList[activePrintingIndex] = {...allValues}}}>
              <Form.Item name="dw" label="印花宽度">
                <InputNumber placeholder="dw" min={1}/>
              </Form.Item>
              <Form.Item name="dh" label="印花高度">
                <InputNumber placeholder="dh" min={1}/>
              </Form.Item>
              <Form.Item name="dx" label="横向偏移">
                <InputNumber placeholder="dx" />
              </Form.Item>
              <Form.Item name="dy" label="纵向偏移">
                <InputNumber placeholder="dy" />
              </Form.Item>
              <Form.Item name="px" label="横向间隔">
                <InputNumber placeholder="px" />
              </Form.Item>
              <Form.Item name="py" label="纵向间隔">
                <InputNumber placeholder="py" />
              </Form.Item>
              <Form.Item name="angle" label="旋转角度">
                <InputNumber placeholder="angle" min={0} max={359}/>
              </Form.Item>
              <Form.Item name="verticalFlip" valuePropName="checked" label="垂直翻转" style={{marginTop: 10}}>
                <Checkbox />
              </Form.Item>
              <Form.Item name="horizontalFlip" valuePropName="checked" label="水平翻转" style={{marginTop: 10}}>
                <Checkbox />
              </Form.Item>
              {/*<Form.Item name="flipIntervals" label="翻转间隔" style={{marginTop: 10}}>*/}
              {/*  <InputNumber placeholder="0" min={0} max={2}/>*/}
              {/*</Form.Item>*/}
            </Form>
          </Header>
          <div className="App">
            {/*<input type="file" onChange={upload}/>*/}
            {/*<input id="canvas" type="file" onChange={uploadPrinting}/>*/}
            {/*<button onClick={showColor}>showColor</button>*/}
            <canvas id={"canvas"} ref={canvasRef1} style={{display: "none"}}/>
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

  const active = (index: number) => {
    props.setActivePrinting(index);
    // props.FieldsValue(index);
    // props.form.setFieldsValue(index);
    // console.log(props.printingOptionsList)
    // console.log(props.printingOptionsList[index])
    // props.form.setFieldsValue({dx:1});
  }

  return <div id="printing-list">
    {list.map(( value,index)=> {
      if ("src" in value) {
        return <div key={index} onClick={()=>{active(index)}}
                    className={index == props.activePrintingIndex ? "active" : ""}>
          <img src={value.src} alt=""/>
        </div>
      }
    })
    }
  </div>
}

export default Printing