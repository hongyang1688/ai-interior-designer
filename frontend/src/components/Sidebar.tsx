import React from 'react'
import { Layout, Menu, Badge } from 'antd'
import {
  HomeOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目管理',
    },
    {
      key: '/studio',
      icon: <AppstoreOutlined />,
      label: '设计工作室',
    },
    {
      key: '/materials',
      icon: <ShoppingOutlined />,
      label: '材料库',
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: (
        <span>
          AI助手
          <Badge count={2} size="small" style={{ marginLeft: 8 }} />
        </span>
      ),
    },
  ]

  return (
    <Sider width={200} style={{ background: '#fff' }}>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  )
}

export default Sidebar