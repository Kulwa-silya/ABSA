# docker/prod/nginx/Dockerfile
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Create nginx directories
RUN mkdir -p /var/cache/nginx/client_temp \
    && chmod 755 /var/cache/nginx/client_temp


# Copy custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/
