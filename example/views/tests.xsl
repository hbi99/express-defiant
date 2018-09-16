<xsl:template name="tests">
   <h1>Tests</h1>
   
   <xsl:for-each select="//book">
      <xsl:value-of select="title"/>
   </xsl:for-each>
   
   <xsl:for-each select="//book">
      <xsl:value-of select="isbn"/>
   </xsl:for-each>

   <xsl:value-of select="//book[4]/category_id"/>
   <xsl:value-of select="//book[last()]"/>
   <xsl:value-of select="//*[category_id=1]"/>
   <xsl:value-of select="//*[category_id=3]/title"/>
   <xsl:value-of select="//book/isbn"/>
   <xsl:value-of select="//title/text()"/>
   <xsl:value-of select="//*[price > 15]"/>
   <xsl:value-of select="//*[contains(title, 'the')]"/>
   <xsl:value-of select="//book[position() &lt; 3]"/>

</xsl:template>