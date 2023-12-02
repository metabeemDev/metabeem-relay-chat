FROM node:18.17.1

#   create a working directory inside the container
WORKDIR /usr/src/app

#   copy the local package.json to the container
COPY package.json ./

#   install project dependencies
RUN npm install

#   copies all files in the current directory into the container (except those specified in .dockerignore)
COPY . .

#   expose the ports used by the application
EXPOSE 6616
EXPOSE 9912

#   run application inside container
CMD [ "node", "src/main.js" ]
