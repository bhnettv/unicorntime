function FindProxyForURL(url, host) {
  if (host === '10.200.0.41') {
    return 'SOCKS5 192.168.150.150:1080; DIRECT';
  }
  return 'DIRECT';
}
