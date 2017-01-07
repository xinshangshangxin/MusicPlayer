# Dockerfile to create a docker image
FROM index.tenxcloud.com/docker_library/node:latest

# Add files to the image
RUN mkdir -p /opt/nodejs
ADD . /opt/nodejs
WORKDIR /opt/nodejs

# Expose the container port
EXPOSE 12345

ENTRYPOINT ["node", "app.js"]