Blockade Browser Protection
==========================
Blockade brings antivirus-like capabilities to users who run the Chrome browser. Built as an extension, Blockade blocks malicious resources from being viewed or loaded inside of the browser.

Install
-------
Blockade is currently available to a small number of alpha users. The extension can be freely downloaded through the Chrome webstore and requires no additional work in order to operate besides the cloud node URL.

https://chrome.google.com/webstore/detail/blockade/dpcbdbpeiafniipmiedlceedbffiejek


Purpose
-------
Blockade focuses on those who are often targeted via phishing attacks and may not have a substantial capability at their disposal. Using threat intelligence mined from multiple sources (and analysts), Blockade attempts to detect attacks that may exist in the browser by monitoring web traffic requests. The primary goal for the project is to detect and prevent as many attacks as possible for those who would otherwise go left unnoticed.

Architecture
------------
.. image:: /screenshots/blockade-architecture.png
  :alt: Reference architecture for Blockade
  :width: 100%
  :align: center

Blockade is split into two pieces, cloud infrastructure and the local Chrome Extension. Intelligence is passed from the cloud infrastructure directly into the browser's local storage. Using special APIs available to extensions, Blockade will look for any web request matching a known indicator and block it from being loaded. Malicious events from Blockade are passed to the cloud infrastructure where analysts can review the findings and surface more attacks. Read more about the infrastructure here_.

.. _here: https://www.blockade.io/architecture.html

Support
-------
If you want more details about the extension and larger project, visit the project page_. For bugs and other problems, please file a message in this repositories issue_ area. For private questions or comments, contact Brandon at info@blockade.io or find us on social media.

.. _page: https://www.blockade.io/
.. _issue: https://github.com/blockadeio/chrome_extension/issues