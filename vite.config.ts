import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    const plugins = [react()] as any[]

    if (command === 'serve') {
        plugins.push(basicSsl())
    }

    return {
        plugins
    }
})
