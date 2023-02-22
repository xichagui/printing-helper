import React, {useEffect, useRef, useState} from 'react'
import './App.css'
import {readPsd} from 'ag-psd';
// import {fabric} from 'fabric';
import {ColorResult, RGBColor, SketchPicker} from 'react-color'
import Printing from "./printing";
import Pattern from './pattern';

function App() {
  return (
      // <Printing/>
    <Pattern/>
    )
}

export default App