import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Box, 
  Plane, 
  Text,
  Environment,
  PerspectiveCamera,
  useTexture,
  Html,
} from '@react-three/drei'
import * as THREE from 'three'
import { Button, Card, Slider, Radio, Space, Tag, message } from 'antd'
import { 
  ExpandOutlined, 
  CompressOutlined,
  EyeOutlined,
  HomeOutlined,
  VideoCameraOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import './Tour3D.css'

// Room component
const Room = ({ 
  width = 10, 
  depth = 10, 
  height = 3, 
  wallColor = '#f5f5f5',
  floorColor = '#d4a373',
  onObjectClick 
}: any) => {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor })
  const floorMaterial = new THREE.MeshStandardMaterial({ color: floorColor })
  
  return (
    <group>
      {/* Floor */}
      <Plane 
        args={[width, depth]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        material={floorMaterial}
        onClick={() => onObjectClick?.('floor')}
      />
      
      {/* Ceiling */}
      <Plane 
        args={[width, depth]} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, height, 0]}
        material={new THREE.MeshStandardMaterial({ color: '#ffffff' })}
      />
      
      {/* Back Wall */}
      <Plane 
        args={[width, height]} 
        position={[0, height/2, -depth/2]}
        material={wallMaterial}
        onClick={() => onObjectClick?.('backWall')}
      />
      
      {/* Front Wall (with opening for entrance) */}
      <Plane 
        args={[width/3, height]} 
        position={[-width/3, height/2, depth/2]}
        material={wallMaterial}
        onClick={() => onObjectClick?.('frontWallLeft')}
      />
      <Plane 
        args={[width/3, height]} 
        position={[width/3, height/2, depth/2]}
        material={wallMaterial}
        onClick={() => onObjectClick?.('frontWallRight')}
      />
      <Plane 
        args={[width/3, height/3]} 
        position={[0, height*5/6, depth/2]}
        material={wallMaterial}
        onClick={() => onObjectClick?.('frontWallTop')}
      />
      
      {/* Left Wall */}
      <Plane 
        args={[depth, height]} 
        rotation={[0, Math.PI/2, 0]}
        position={[-width/2, height/2, 0]}
        material={wallMaterial}
        onClick={() => onObjectClick?.('leftWall')}
      />
      
      {/* Right Wall (with window) */}
      <Plane 
        args={[depth/3, height/2]} 
        rotation={[0, Math.PI/2, 0]}
        position={[width/2, height*3/4, -depth/3]}
        material={wallMaterial}
        onClick={() => onObjectClick?.('rightWallTop')}
      />
      <Plane 
        args={[depth/3, height/2]} 
        rotation={[0, Math.PI/2, 0]}
        position={[width/2, height*3/4, depth/3]}
        material={wallMaterial}
        onClick={() => onObjectClick?.('rightWallBottom')}
      />
      <Plane 
        args={[depth/3, height/4]} 
        rotation={[0, Math.PI/2, 0]}
        position={[width/2, height/8, 0]}
        material={wallMaterial}
        onClick={() => onObjectClick?.('rightWallLeft')}
      />
      
      {/* Window frame */}
      <Box args={[0.1, 2, 3]} position={[width/2, 1.5, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
    </group>
  )
}

// Furniture components
const Sofa = ({ position = [0, 0, 0], color = '#8B4513', onClick }: any) => {
  return (
    <group position={position} onClick={onClick}>
      {/* Base */}
      <Box args={[3, 0.5, 1.5]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      {/* Back */}
      <Box args={[3, 1, 0.3]} position={[0, 0.75, -0.6]}>
        <meshStandardMaterial color={color} />
      </Box>
      {/* Armrests */}
      <Box args={[0.3, 0.8, 1.5]} position={[-1.35, 0.4, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[0.3, 0.8, 1.5]} position={[1.35, 0.4, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      
      <Html distanceFactor={10}>
        <div className="furniture-label">沙发</div>
      </Html>
    </group>
  )
}

const TVUnit = ({ position = [0, 0, 0], onClick }: any) => {
  return (
    <group position={position} onClick={onClick}>
      {/* TV Stand */}
      <Box args={[2.5, 0.6, 0.5]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#2c2c2c" />
      </Box>
      {/* TV */}
      <Box args={[2, 1.2, 0.1]} position={[0, 1.3, 0.1]}>
        <meshStandardMaterial color="#1a1a1a" emissive="#000033" emissiveIntensity={0.2} />
      </Box>
      
      <Html distanceFactor={10}>
        <div className="furniture-label">电视柜</div>
      </Html>
    </group>
  )
}

const CoffeeTable = ({ position = [0, 0, 0], onClick }: any) => {
  return (
    <group position={position} onClick={onClick}>
      <Box args={[1.5, 0.4, 0.8]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#d4a373" />
      </Box>
      
      <Html distanceFactor={10}>
        <div className="furniture-label">茶几</div>
      </Html>
    </group>
  )
}

const Bed = ({ position = [0, 0, 0], onClick }: any) => {
  return (
    <group position={position} onClick={onClick}>
      {/* Mattress */}
      <Box args={[2, 0.4, 2.5]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#f5f5f5" />
      </Box>
      {/* Headboard */}
      <Box args={[2, 1.2, 0.2]} position={[0, 0.6, -1.15]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      {/* Pillows */}
      <Box args={[0.6, 0.15, 0.4]} position={[-0.5, 0.75, -0.8]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[0.6, 0.15, 0.4]} position={[0.5, 0.75, -0.8]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      
      <Html distanceFactor={10}>
        <div className="furniture-label">床</div>
      </Html>
    </group>
  )
}

// Camera positions for different views
const viewPositions: any = {
  'living-sofa': { position: [0, 1.6, 4], target: [0, 1, 0] },
  'living-tv': { position: [0, 1.6, -4], target: [0, 1, 0] },
  'bedroom-bed': { position: [0, 1.6, 3], target: [0, 0.5, 0] },
  'bird-eye': { position: [0, 8, 8], target: [0, 0, 0] },
  'entrance': { position: [0, 1.6, 6], target: [0, 1, 0] },
}

const CameraController = ({ view }: { view: string }) => {
  const { camera } = useThree()
  
  useEffect(() => {
    const config = viewPositions[view] || viewPositions['bird-eye']
    camera.position.set(...config.position)
    camera.lookAt(...config.target)
  }, [view, camera])
  
  return null
}

interface Tour3DProps {
  roomType?: 'living' | 'bedroom' | 'kitchen'
  style?: string
}

const Tour3D: React.FC<Tour3DProps> = ({ roomType = 'living', style = 'modern' }) => {
  const [currentView, setCurrentView] = useState('bird-eye')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedObject, setSelectedObject] = useState<string | null>(null)
  const [showLabels, setShowLabels] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleObjectClick = (objectName: string) => {
    setSelectedObject(objectName)
    message.info(`点击了: ${objectName}`)
  }

  const getStyleColors = () => {
    switch (style) {
      case 'nordic':
        return { wall: '#fafafa', floor: '#e8d5c4' }
      case 'chinese':
        return { wall: '#f5f0e8', floor: '#8b6914' }
      case 'luxury':
        return { wall: '#f8f8f8', floor: '#2c2c2c' }
      default:
        return { wall: '#f5f5f5', floor: '#d4a373' }
    }
  }

  const colors = getStyleColors()

  return (
    <div ref={containerRef} className={`tour-3d-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <Card
        title={
          <Space>
            <VideoCameraOutlined />
            <span>3D漫游 - {roomType === 'living' ? '客厅' : roomType === 'bedroom' ? '卧室' : '厨房'}</span>
            <Tag color="blue">{style}</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={showLabels ? <EyeOutlined /> : <EyeOutlined />}
              onClick={() => setShowLabels(!showLabels)}
              size="small"
            >
              {showLabels ? '隐藏标签' : '显示标签'}
            </Button>
            <Button 
              icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={toggleFullscreen}
              size="small"
            >
              {isFullscreen ? '退出全屏' : '全屏'}
            </Button>
          </Space>
        }
        bodyStyle={{ padding: 0 }}
      >
        <div className="tour-3d-layout">
          {/* 3D Canvas */}
          <div className="tour-3d-canvas">
            <Canvas shadows camera={{ position: [0, 8, 8], fov: 60 }}>
              <CameraController view={currentView} />
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={15}
                maxPolarAngle={Math.PI / 2 - 0.1}
              />
              
              {/* Lighting */}
              <ambientLight intensity={0.5} />
              <directionalLight 
                position={[5, 10, 5]} 
                intensity={1}
                castShadow
              />
              <pointLight position={[0, 3, 0]} intensity={0.5} />
              
              {/* Environment */}
              <Environment preset="apartment" />
              
              {/* Room */}
              <Room 
                wallColor={colors.wall}
                floorColor={colors.floor}
                onObjectClick={handleObjectClick}
              />
              
              {/* Furniture based on room type */}
              {roomType === 'living' && (
                <>
                  <Sofa position={[0, 0, 1.5]} color="#8B4513" onClick={() => handleObjectClick('sofa')} />
                  <TVUnit position={[0, 0, -3.5]} onClick={() => handleObjectClick('tv')} />
                  <CoffeeTable position={[0, 0, 3]} onClick={() => handleObjectClick('coffeeTable')} />
                </>
              )}
              
              {roomType === 'bedroom' && (
                <>
                  <Bed position={[0, 0, -1]} onClick={() => handleObjectClick('bed')} />
                </>
              )}
              
              {/* Grid helper */}
              <gridHelper args={[10, 10, '#888888', '#cccccc']} position={[0, 0.01, 0]} />
            </Canvas>
          </div>

          {/* Control Panel */}
          <div className="tour-3d-controls">
            <Card title="视角控制" size="small">
              <Radio.Group 
                value={currentView} 
                onChange={(e) => setCurrentView(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio.Button value="bird-eye" style={{ width: '100%' }}>
                    🦅 鸟瞰图
                  </Radio.Button>
                  <Radio.Button value="living-sofa" style={{ width: '100%' }}>
                    🛋️ 沙发视角
                  </Radio.Button>
                  <Radio.Button value="living-tv" style={{ width: '100%' }}>
                    📺 电视视角
                  </Radio.Button>
                  <Radio.Button value="entrance" style={{ width: '100%' }}>
                    🚪 入口视角
                  </Radio.Button>
                </Space>
              </Radio.Group>
            </Card>

            <Card title="风格预览" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block>现代简约</Button>
                <Button block>北欧风</Button>
                <Button block>新中式</Button>
                <Button block>轻奢</Button>
              </Space>
            </Card>

            {selectedObject && (
              <Card title="选中对象" size="small" style={{ marginTop: 16 }}>
                <p>{selectedObject}</p>
                <Button type="primary" block>
                  更换材质
                </Button>
              </Card>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Tour3D