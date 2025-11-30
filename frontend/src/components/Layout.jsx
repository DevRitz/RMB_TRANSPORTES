import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  DollarSign, 
  Receipt, 
  BarChart3, 
  Menu,
  Home,
  Plus,
  Fuel,
  User,
  Wrench,
  Pen,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Caminhões', href: '/trucks', icon: Truck },
    { 
      name: 'Receitas', 
      icon: Receipt,
      children: [
        { name: 'Registrar Receita', href: '/revenues/new', icon: DollarSign },
        { name: 'Editar Receita', href: '/revenues/list', icon: Pen },
      ]
    },
    {
      name: 'Despesas',
      icon: Receipt,
      children: [
        // NOVO: tela unificada de gestão
        { name: 'Gerenciar Despesas', href: '/expenses/manage', icon: Pen },

        // Combustível
        { name: 'Registrar Combustível', href: '/expenses/fuel/new', icon: Fuel },

        // Motorista
        { name: 'Registrar Motorista', href: '/expenses/driver/new', icon: User },

        // Manutenção
        { name: 'Registrar Manutenção', href: '/expenses/maintenance/new', icon: Wrench },

        // Outras despesas
        { name: 'Registrar Outras Despesas', href: '/expenses/other/new', icon: Receipt },
      ],
    },
    { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  ];

  const isActive = (href) => location.pathname === href;

  const NavItems = ({ mobile = false }) => (
    <nav className="space-y-2">
      {navigation.map((item) => {
        if (item.children) {
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground">
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </div>
              <div className="ml-6 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    to={child.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(child.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => mobile && setSidebarOpen(false)}
                  >
                    <child.icon className="mr-3 h-4 w-4" />
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => mobile && setSidebarOpen(false)}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-card border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <Truck className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-foreground">RMB Transportes</span>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <div className="px-3">
              <NavItems />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full pt-5 pb-4 overflow-y-auto bg-card">
            <div className="flex items-center flex-shrink-0 px-4">
              <Truck className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-foreground">RMB Transportes</span>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <div className="px-3">
                <NavItems mobile />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground ml-12 md:ml-0">
              Sistema de Controle de Frotas
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Olá, <span className="font-medium">{user?.username}</span>
              </div>
              <Button asChild>
                <Link to="/trucks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Caminhão
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
