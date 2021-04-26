FROM node:15.4.0

RUN mkdir -p /usr/src/eventbridge-docs
WORKDIR /usr/src/eventbridge-docs

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

# Download AWS CLI so we can use in the docker environment
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install

# Entry point when running docker image. Will require .env being passed through.
CMD ["sh", "scripts/run.sh"]
