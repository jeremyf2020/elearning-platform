FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Creates a dummy package.json so the build doesn't crash if you haven't started React yet
RUN npm init -y 
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]