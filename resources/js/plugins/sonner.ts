import { App } from 'vue'
import Toaster from 'vue-sonner'

export function registerSonner(app: App) {
  app.use(Toaster, {
    rich: true,         
    position: 'top-right', 
    duration: 3000,     
  })
}
