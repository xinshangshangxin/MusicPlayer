# Dockerfile to create a docker image
FROM index.tenxcloud.com/docker_library/node:latest

# Add files to the image
RUN mkdir -p /opt/nodejs
ADD . /opt/nodejs
WORKDIR /opt/nodejs

ENV NODE_ENV leancloud
# Expose the container port
EXPOSE 3000

ENTRYPOINT ["node", "app.js"]